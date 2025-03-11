import mongoose from "mongoose";

export interface ITask extends Document {
  title: string;
  description: string;
  status: "Pending" | "In Progress" | "Completed";
  dueDate: Date;
  assignedTo: mongoose.Schema.Types.ObjectId;
  createdBy: mongoose.Schema.Types.ObjectId;
}
