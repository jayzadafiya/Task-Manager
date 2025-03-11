import mongoose from "mongoose";
import TaskModel from "../models/Task.model";
import { Request, Response } from "express";
import { BadRequestException } from "../utils/exceptions";
import { createOne, deleteOne, getOne, updateOne } from "../utils/helper";
import { AuthRequest } from "../interfaces/auth-request.interface";

class taskController {
  private checkTaskOwnership = async (req: AuthRequest, id: string) => {
    const task = await getOne(TaskModel, new mongoose.Types.ObjectId(id));

    if (!task) {
      throw new BadRequestException("Task not found");
    }

    if (
      task?.createdBy.toString() !== req.user?._id?.toString() &&
      req.user?.role !== "Admin"
    ) {
      throw new BadRequestException(
        "This is not your task. You can't create task for others."
      );
    }

    return task;
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

      res.json({
        success: true,
        message: "Task updated successfully",
        updatedTask,
      });
    } catch (error: any) {
      res.status(error.statusCode).json({ message: error.message });
    }
  };

  deleteTask = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await this.checkTaskOwnership(req, id);

      await deleteOne(TaskModel, new mongoose.Types.ObjectId(id));
      res.json({ success: true, message: "Task deleted successfully" });
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

      res
        .status(200)
        .json({ success: true, message: "Task assigned successfully", task });
    } catch (error: any) {
      res.status(error.statusCode).json({ message: error.message });
    }
  };
}

export const TaskController = new taskController();
