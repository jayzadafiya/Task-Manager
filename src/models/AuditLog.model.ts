import mongoose, { Schema, Document } from "mongoose";
import { IAuditLog } from "../interfaces/auditLog.interface";

const AuditLogSchema: Schema = new Schema(
  {
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: true,
    },
    logs: [
      {
        action: {
          type: String,
          required: true,
          enum: ["Created", "Updated", "Deleted"],
        },
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

AuditLogSchema.path("logs").schema.set("id", false);
AuditLogSchema.path("logs").schema.set("_id", false);

export default mongoose.model<IAuditLog>("AuditLog", AuditLogSchema);
