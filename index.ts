import * as dotenv from "dotenv";
dotenv.config();

import * as express from "express";
import * as cors from "cors";
import * as http from "http";
import connectDB from "./src/config/db.config";
import globalErrorHandler from "./src/middleware/error-handler.middleware";
import router from "./src/routes/v1.router";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import * as ExpressMongoSanitize from "express-mongo-sanitize";
import { configureWebSocket } from "./src/config/socket.config";
import { TaskController } from "./src/controllers/task.controller";
const xss = require("xss-clean");

const app = express();
const socketServer = http.createServer(app);
const io = configureWebSocket(socketServer);
const PORT = process.env.PORT;

connectDB();
export { io };

app.use(cors());
app.use(express.json());

app.use(helmet());
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many request for this Ip, please try again in a hour",
});

TaskController.startCronJobs();
app.use(limiter);
app.use(ExpressMongoSanitize());

app.use(xss());

app.use("/api/v1", router);

app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    globalErrorHandler(err, req, res, next);
  }
);

const server = socketServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

process.on("uncaughtException", (err) => {
  console.log("uncaughtException! Shutting down....");
  console.log(err.name, err.message);
  process.exit(1);
});

process.on("unhandledRejection", (err: any) => {
  console.log("UNHANDLED REJECTION! 💥 Shutting down...");
  console.log(err.name, err.message);
  server.close();
  process.exit(1);
});
