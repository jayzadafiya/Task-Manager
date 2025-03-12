import mongoose from "mongoose";

export interface ITask extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  status: "Pending" | "In Progress" | "Completed";
  dueDate: Date;
  assignedTo: mongoose.Schema.Types.ObjectId;
  createdBy: mongoose.Schema.Types.ObjectId;
}
