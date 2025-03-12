import { Router } from "express";
import { TaskController } from "../controllers/task.controller";
import authMiddleware from "../middleware/auth.middleware";
import {
  validateAssignTask,
  validateCreateTask,
  validateTaskId,
  validateUpdateTask,
} from "../validations/task.validation";
import { validateRequest } from "../middleware/validateRequest";
const taskRouter = Router();

taskRouter.get(
  "/:id",
  authMiddleware,
  validateTaskId,
  validateRequest,
  TaskController.getTaskById
);

taskRouter.post(
  "/",
  authMiddleware,
  validateCreateTask,
  validateRequest,
  TaskController.createTask
);
taskRouter.put(
  "/:id",
  authMiddleware,
  validateUpdateTask,
  validateRequest,
  TaskController.updateTask
);
taskRouter.delete(
  "/:id",
  authMiddleware,
  validateTaskId,
  validateRequest,
  TaskController.deleteTask
);
taskRouter.patch(
  "/:id/assign",
  authMiddleware,
  validateAssignTask,
  validateRequest,
  TaskController.assignTask
);

taskRouter.patch(
  "/:id/status",
  authMiddleware,
  validateTaskId,
  validateRequest,
  TaskController.updateTaskStatus
);

export default taskRouter;
