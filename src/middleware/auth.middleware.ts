import UserModel from "../models/User.model";
import * as jwt from "jsonwebtoken";
import { NextFunction, Response } from "express";
import { AuthRequest } from "../interfaces/auth-request.interface";
import { BadRequestException } from "../utils/exceptions";

exports.protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies.jwt) {
      token = req.cookies.jwt;
    }

    if (!token) {
      throw new BadRequestException("You are not logged in!!");
    }

    // Verification token
    const decoded: any = await new Promise((resolve, reject) => {
      jwt.verify(token, process.env.JWT_SECRET!, (err: any, decoded: any) => {
        if (err) {
          return reject(err);
        }
        resolve(decoded);
      });
    });

    // Check if user still exists
    const freshUser = await UserModel.findById(decoded.id);
    if (!freshUser) {
      throw new BadRequestException(
        "User belonging to this token does no longer exist"
      );
    }

    // Check if user change password after the token was issued
    if (freshUser.changedPasswordAfter(decoded.iat)) {
      throw new BadRequestException("Password is change please Login again");
    }
    res.locals.user = freshUser;
    req.user = freshUser;

    next();
  } catch (error: any) {
    return res.status(error.statusCode).json({ message: error.message });
  }
};
