import { NextFunction, Response } from "express";
import { AuthRequest } from "../interfaces/auth-request.interface";
import { ForbiddenException } from "../utils/exceptions";

const restrictTo = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user?.role!)) {
      throw new ForbiddenException(
        "you do not have permission to perform this action"
      );
    }
    next();
  };
};
export default restrictTo;
