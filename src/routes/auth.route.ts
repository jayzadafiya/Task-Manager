import * as express from "express";
import { AuthController } from "../controllers/auth.controller";
import { validateLogin, validateSignUp } from "../validations/auth.validation";
import { validateRequest } from "../middleware/validateRequest";

const authRouter = express.Router();

authRouter.post(
  "/signup",
  validateSignUp,
  validateRequest,
  AuthController.signup
);

authRouter.post("/login", validateLogin, validateRequest, AuthController.login);

export default authRouter;
