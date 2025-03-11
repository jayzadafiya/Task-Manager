import mongoose from "mongoose";

export interface IUser extends Document {
    _id: mongoose.Types.ObjectId,
    username: string;
    email: string;
    password?: string;
    role: "Admin" | "User";
    correctPassword: (candidatePassword: string,
        userPassword: string) => string;
    changedPasswordAfter: (JWTTimestamp: number) => boolean;
}