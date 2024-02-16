import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import router from './Backend/route/router.js';
import http from 'http'
import {Server} from 'socket.io'
import { receiveMessage} from './Backend/controller/chatPublicly.js'
import { loadMessages } from './Backend/model/Message.js'
import cors from 'cors'


const app = express();
const port = 3000;

// Serving static files in view
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
app.use(express.static(path.join(__dirname, 'Frontend', 'views')));

//setting up socket connection
const server = http.createServer(app)
const io = new Server(server)
export default io
app.use(cors())


// Setting up view engine
app.set('views', path.join(__dirname, 'Frontend', 'views'));
app.set("view engine", "ejs")

// Body-Parser
import body_parser from 'body-parser';
app.use(body_parser.urlencoded({ extended: false }));
app.use(express.json())
app.use(express.urlencoded({ extended: true }));

// MongoDB connection
import mongoose from 'mongoose';
const dburi = "mongodb+srv://daniilturpitka:Letoosen228@cluster0.1fayqt0.mongodb.net/?retryWrites=true&w=majority"

async function connectdb() {
  try {
    await mongoose.connect(dburi)
    console.log("db connected")
  }
  catch (error) {
    console.log("some error has occured while connecting database")
  }
}
connectdb()

io.on("connection", async (socket)=>{
  console.log(socket.id)
  const msgs = await loadMessages()
  socket.emit('initMessages', {empty: false, archive:msgs})

  socket.on("chat message", async (data)=>{
        try{
          receiveMessage(data, io)
        }catch(error){
          console.log(error)
        }
    
  })


})

app.use(router)
server.listen(port, function () {
  console.log(`Listening port... ${port}`);
  
});







