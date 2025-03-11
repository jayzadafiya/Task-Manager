import mongoose, { Schema, Document } from "mongoose";
import * as bcrypt from "bcryptjs";
import { IUser } from "../interfaces/user.interface";

const UserSchema: Schema = new Schema({
  username: { type: String, required: true, trim: true },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: { type: String, required: true, select: false, minLength: 6 },
  role: { type: String, enum: ["Admin", "User"], default: "User" },
});

UserSchema.pre("save", async function (next) {
  const user = this as unknown as IUser & Document;

  if (!user.isModified("password")) return next();

  user.password = await bcrypt.hash(user.password!, 12);
  next();
});

// Instance method: Compare input password with hashed password
UserSchema.methods.correctPassword = async function (
  candidatePassword: string,
  userPassword: string
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// Instance method: Check if password was changed after JWT issued
UserSchema.methods.changedPasswordAfter = function (
  JWTTimestamp: number
): boolean {
  if (this.passwordChangedAt) {
    const changedTimestamp = Math.floor(
      this.passwordChangedAt.getTime() / 1000
    );
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

export default mongoose.model<IUser>("User", UserSchema);
