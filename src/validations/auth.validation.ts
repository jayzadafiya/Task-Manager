import { body } from "express-validator";

export const validateLogin = [
  body("email")
    .trim()
    .isEmail()
    .withMessage("Email must be a valid email address"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters")
    .matches(/[A-Z]/)
    .withMessage("Password must contain at least one uppercase letter")
    .matches(/[a-z]/)
    .withMessage("Password must contain at least one lowercase letter")
    .matches(/[0-9]/)
    .withMessage("Password must contain at least one number")
    .matches(/[\W_]/)
    .withMessage("Password must contain at least one special character"),
];

export const validateSignUp = [
  ...validateLogin,
  body("username")
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage("Username must be 3-30 characters long"),
  body("role")
    .optional()
    .isIn(["Admin", "User"])
    .withMessage("Role must be either 'Admin' or 'User'"),
];
