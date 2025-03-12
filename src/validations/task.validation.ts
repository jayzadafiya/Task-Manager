import { body, param } from "express-validator";
import * as moment from "moment";

export const validateCreateTask = [
  body("title").notEmpty().withMessage("Title is required").trim(),
  body("description").notEmpty().withMessage("Description is required").trim(),
  body("status")
    .optional()
    .isIn(["Pending", "In Progress", "Completed"])
    .withMessage("Status must be one of: Pending, In Progress, Completed"),
  body("dueDate")
    .isISO8601()
    .withMessage("Invalid date format")
    .custom((value) => {
      if (moment(value).isBefore(moment().startOf("day"))) {
        throw new Error("Due date must be today or a future date.");
      }
      return true;
    }),
];

export const validateUpdateTask = [
  param("id").isMongoId().withMessage("Invalid task ID"),
  body("title").optional().trim(),
  body("description").optional().trim(),
  body("status")
    .optional()
    .isIn(["Pending", "In Progress", "Completed"])
    .withMessage("Status must be one of: Pending, In Progress, Completed"),
  body("dueDate")
    .optional()
    .isISO8601()
    .withMessage("Invalid date format")
    .custom((value) => {
      if (moment(value).isBefore(moment().startOf("day"))) {
        throw new Error("Due date must be today or a future date.");
      }
      return true;
    }),
];

export const validateTaskId = [
  param("id").isMongoId().withMessage("Invalid task ID"),
];

export const validateAssignTask = [
  param("id").isMongoId().withMessage("Invalid task ID"),
  body("assignedTo").isMongoId().withMessage("Invalid user ID"),
];
