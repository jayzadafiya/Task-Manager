import { Server as HttpServer } from "http";
import { Server as SocketServer, Socket } from "socket.io";

const userSockets = new Map<string, string>();

export const configureWebSocket = (server: HttpServer) => {
  const io = new SocketServer(server, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket: Socket) => {
    console.log("A user connected:", socket.id);

    socket.on("register", (userId: string) => {
      userSockets.set(userId, socket.id);
      socket.join(userId);
      console.log(`User ${userId} registered with socket ${socket.id}`);
    });

    socket.on("disconnect", () => {
      const userId = [...userSockets.entries()].find(
        ([_, id]) => id === socket.id
      )?.[0];
      if (userId) {
        userSockets.delete(userId);
        console.log(`User ${userId} disconnected`);
      }
      console.log("Socket disconnected:", socket.id);
    });
  });

  return io;
};
