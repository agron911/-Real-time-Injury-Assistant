
import {MessageObj} from "../model/Message.js"
import { io } from "../utils/socketSetup.js";
export const ChatroomView = (req, res) => {
    res.render("chatroom");
};

export const receiveMessage = async(req, res)=>{
    console.log(req.body.status)
    const mess = new MessageObj(req.body.username, req.body.content, req.body.timestamp, req.body.status);
    console.log(mess.obj)
    const message = await mess.storeMessage()
    io.emit('chat message', mess.obj)
}

export const loadMessages = async(req, res) => {
    const messages = await MessageObj.loadArchive();
    res.send({archive:messages})
}

    

  



