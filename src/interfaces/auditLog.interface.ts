import mongoose from "mongoose";

interface ILog {
  action: "Created" | "Updated" | "Deleted";
  user: mongoose.Types.ObjectId;
  timestamp: Date;
}

export interface IAuditLog extends Document {
  taskId: mongoose.Types.ObjectId;
  logs: ILog[];
}
