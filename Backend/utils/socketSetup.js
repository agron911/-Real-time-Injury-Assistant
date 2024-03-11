import { Server } from "socket.io";
import { deregisterUserSocket } from "../controller/loginController.js";
import { loadPublicMessages } from "../controller/chatPublicly.js";

export let io = {};

export const setupSocket = (server) => {
  io = new Server(server);
  io.on("connection", async(socket) => {
    console.log("Socket connected!", socket.id);
    
    //const msgs = await getMessages();

    //socket.emit('initMessages', {empty: false, archive:msgs})

    socket.on("disconnect", async() => {
      await deregisterUserSocket(socket.id);
      console.log("Socket disconnected", socket.id);
    });
    

    socket.on("chat message", async (data)=>{
          try{
            receiveMessage(data, io)
          }catch(error){
            console.log(error)
          }

    })


  });
  // io.on("disconnect", () =>)
  return io;
};
