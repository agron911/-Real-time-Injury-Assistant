import { Server } from "socket.io";
import { deregisterUserSocket } from "../controller/loginController.js";
import { loadPublicMessages } from "../controller/chatPublicly.js";
import { stopTest } from "../controller/speedtest.js";
import MainServer from "../../server.js";

export let io = {};

export const setupSocket = (server) => {
  io = new Server(server);
  io.on("connection", async(socket) => {
    console.log("Socket connected!", socket.id);
    
    //const msgs = await getMessages();

    //socket.emit('initMessages', {empty: false, archive:msgs})

    socket.on("disconnect", async() => {
      if(MainServer.instance.testSocketID == socket.id) {
        await stopTest();
      };
      await deregisterUserSocket(socket.id);
      console.log("Socket disconnected", socket.id, MainServer.instance.testSocketID);
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
