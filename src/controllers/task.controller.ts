import mongoose from "mongoose";
import TaskModel from "../models/Task.model";
import { Request, Response } from "express";
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from "../utils/exceptions";
import { createOne, deleteOne, getOne, updateOne } from "../utils/helper";
import { AuthRequest } from "../interfaces/auth-request.interface";
import AuditLogModel from "../models/AuditLog.model";
import { io } from "../..";
import moment = require("moment");
import * as cron from "node-cron";

class taskController {
  private checkTaskOwnership = async (req: AuthRequest, id: string) => {
    const task = await getOne(TaskModel, new mongoose.Types.ObjectId(id));

    if (!task) {
      throw new NotFoundException("Task not found");
    }

    if (
      task?.createdBy.toString() !== req.user?._id?.toString() &&
      req.user?.role !== "Admin"
    ) {
      throw new UnauthorizedException(
        "This is not your task. You can't create task for others."
      );
    }

    return task;
  };

  private logTaskAction = async (
    userId: string,
    taskId: string,
    action: string
  ) => {
    try {
      await AuditLogModel.findOneAndUpdate(
        { taskId },
        {
          $push: {
            logs: { action, user: userId, timestamp: new Date() },
          },
        },
        { upsert: true, new: true }
      );
    } catch (error) {
      console.error("Error logging task action:", error);
    }
  };

  notifyUser = (userId: string, message: string) => {
    io.to(userId).emit("notification", { message });
  };

  getTaskById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      if (!id) {
        throw new BadRequestException("Task ID is required");
      }

      const task = await this.checkTaskOwnership(req, id);

      res.status(200).json({ success: true, data: task });
    } catch (error: any) {
      res.status(error.statusCode).json({ message: error.message });
    }
  };

  createTask = async (req: AuthRequest, res: Response) => {
    try {
      const { title, description, dueDate } = req.body;

      if (!title || !description || !dueDate) {
        throw new BadRequestException(
          "Title, description, and due date are required."
        );
      }

      const task = await createOne(TaskModel, {
        ...req.body,
        createdBy: req.user?._id!,
      });
      await this.logTaskAction(
        req.user?._id?.toString()!,
        task?._id?.toString()!,
        "Created"
      );
      res
        .status(201)
        .json({ success: true, message: "Task created successfully", task });
    } catch (error: any) {
      res.status(error.statusCode).json({ message: error.message });
    }
  };

  updateTask = async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      await this.checkTaskOwnership(req, id);
      const updatedTask = await updateOne(
        TaskModel,
        new mongoose.Types.ObjectId(id),
        updateData
      );
      if (!updatedTask) {
        throw new BadRequestException("Task not found.");
      }

      await this.logTaskAction(
        req.user?._id?.toString()!,
        updatedTask?._id?.toString()!,
        "Updated"
      );

      this.notifyUser(
        req?.user?._id.toString()!,
        `Your Task has been updated: ${updatedTask.title}`
      );

      res.json({
        success: true,
        message: "Task updated successfully",
        updatedTask,
      });
    } catch (error: any) {
      res.status(error.statusCode).json({ message: error.message });
    }
  };

  deleteTask = async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      await this.checkTaskOwnership(req, id);

      await deleteOne(TaskModel, new mongoose.Types.ObjectId(id));

      await this.logTaskAction(req.user?._id?.toString()!, id, "Updated");

      res
        .status(204)
        .json({ success: true, message: "Task deleted successfully" });
    } catch (error: any) {
      res.status(error.statusCode).json({ message: error.message });
    }
  };

  assignTask = async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { assignedTo } = req.body;

      if (!mongoose.Types.ObjectId.isValid(assignedTo)) {
        throw new BadRequestException("Invalid user ID.");
      }

      const task = await this.checkTaskOwnership(req, id);

      task.assignedTo = assignedTo;
      await updateOne(TaskModel, new mongoose.Types.ObjectId(id), {
        assignedTo,
      });

      this.notifyUser(
        req?.user?._id.toString()!,
        `You have been assigned a new task: ${task.title}`
      );
      res
        .status(200)
        .json({ success: true, message: "Task assigned successfully", task });
    } catch (error: any) {
      res.status(error.statusCode).json({ message: error.message });
    }
  };

  updateTaskStatus = async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const validStatuses = ["Pending", "In Progress", "Completed"];
      if (!validStatuses.includes(status)) {
        throw new BadRequestException(
          "Invalid status value. Use: Pending, In Progress, Completed."
        );
      }

      const task = await getOne(TaskModel, new mongoose.Types.ObjectId(id));
      if (!task) {
        throw new NotFoundException("Task not found.");
      }

      const isTaskOwner =
        task.createdBy.toString() === req.user?._id.toString();
      const isTaskAssigned =
        task.assignedTo?.toString() === req.user?._id.toString();
      const isAdmin = req.user?.role === "Admin";

      if (!isAdmin && !isTaskOwner && !isTaskAssigned) {
        throw new UnauthorizedException(
          "You do not have permission to update this task."
        );
      }

      task.status = status;

      await updateOne(TaskModel, new mongoose.Types.ObjectId(id), {
        status,
      });

      res
        .status(200)
        .json({ message: "Task status updated successfully.", task });
    } catch (error: any) {
      res.status(error.statusCode).json({ message: error.message });
    }
  };

  getTaskAuditLogs = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await this.checkTaskOwnership(req, id);

      const logs = await AuditLogModel.findOne({ taskId: id }).populate(
        "logs.user",
        "name email"
      );

      if (!logs) {
        throw new NotFoundException("No audit logs found for this task");
      }

      res.status(200).json({ success: true, logs });
    } catch (error: any) {
      res.status(error.statusCode).json({ message: error.message });
    }
  };

  taskDueReminder = async () => {
    console.log("Checking for upcoming due tasks...");

    const now = moment();
    const nextDay = moment().add(1, "day");

    const tasks = await TaskModel.find({
      dueDate: { $gte: now.toDate(), $lt: nextDay.toDate() },
      status: { $ne: "completed" },
    });

    console.log(tasks);

    tasks.forEach((task) => {
      this.notifyUser(
        task?.assignedTo?.toString(),
        `Reminder: Task "${task.title}" is due soon!`
      );
      console.log(`Reminder sent for task "${task.title}"`);
    });
  };

  startCronJobs = () => {
    cron.schedule("0 0 * * *", this.taskDueReminder);
    console.log("Task reminder cron job scheduled.");
  };
}

export const TaskController = new taskController();
