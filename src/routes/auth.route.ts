import * as express from "express";
import { AuthController } from "../controllers/auth.controller";
import { validateSignup } from "../middleware/validations/validate-signup.middleware";
import { validateLogin } from "../middleware/validations/validate-login.middleware";

const authRouter = express.Router();

authRouter.post(
  "/signup",
  validateSignup,
  (req: any, res: express.Response, next: express.NextFunction) => {
    AuthController.signup(req, res).catch(next);
  }
);

authRouter.post(
  "/login",
  validateLogin,
  (req: any, res: express.Response, next: express.NextFunction) => {
    AuthController.login(req, res).catch(next);
  }
);

export default authRouter;
