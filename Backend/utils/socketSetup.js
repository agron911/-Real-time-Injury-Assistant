import { Server } from "socket.io";
import { deregisterUserSocket } from "../controller/loginController.js";

export const setupSocket = (server) => {
  const io = new Server(server);
  io.on("connection", (socket) => {
    console.log("Socket connected!", socket.id);
    
    socket.on("disconnect", async() =>{
      await deregisterUserSocket(socket.id);
      console.log("Socket disconnected", socket.id);
    });
  });
  // io.on("disconnect", () =>)
  return io;
};
