import * as jwt from "jsonwebtoken";
import mongoose from "mongoose";
import UserModel from "../models/User.model";
import { Response } from "express";
import { BadRequestException } from "../utils/exceptions";
import { createOne, getOneByEmail } from "../utils/helper";
import { IUser } from "../interfaces/user.interface";
import { AuthRequest } from "../interfaces/auth-request.interface";
import { io } from "../..";

class authController {
  private signToken = (id: mongoose.Types.ObjectId) => {
    let jwtExpiresIn: any = process.env.JWT_EXPIRES_IN || "1d";

    if (!isNaN(Number(jwtExpiresIn))) {
      jwtExpiresIn = Number(jwtExpiresIn);
    }
    return jwt.sign({ id }, process.env.JWT_SECRET!, {
      expiresIn: jwtExpiresIn,
    });
  };

  private createSendToken = async (
    user: IUser,
    statusCode: number,
    res: Response
  ) => {
    const token = this.signToken(user._id);
    const cookieOption = {
      expires: new Date(
        Date.now() +
          (Number(process.env.JWT_COOKIE_EXPIRES_IN) || 1) * 24 * 60 * 60 * 1000
      ),
      httpOnly: true,
    };

    res.cookie("jwt", token, cookieOption);
    user.password = undefined;

    io.emit("register", user._id.toString());

    res.status(statusCode).json({
      status: "success",
      token,
      data: {
        user,
      },
    });
  };

  signup = async (req: AuthRequest, res: Response) => {
    try {
      const { email } = req.body;

      let user = await getOneByEmail(UserModel, email);

      if (user) throw new BadRequestException("User already exist");
      user = await createOne(UserModel, req.body);

      if (!user) throw new BadRequestException("User does not create");
      this.createSendToken(user, 201, res);
    } catch (error: any) {
      res.status(error.statusCode).json({ message: error.message });
    }
  };

  login = async (req: AuthRequest, res: Response): Promise<any> => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res
          .status(400)
          .json({ message: "Please provide email and password" });
      }

      const user = await UserModel.findOne({ email }).select("+password");

      if (!user || !(await user.correctPassword(password, user.password!))) {
        throw new BadRequestException("Incorrect email or password");
      }

      this.createSendToken(user, 200, res);
    } catch (error: any) {
      res.status(error.statusCode).json({ message: error.message });
    }
  };
}

export const AuthController = new authController();
