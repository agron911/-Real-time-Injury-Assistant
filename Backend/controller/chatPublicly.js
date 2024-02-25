
import {MessageObj} from "../model/Message.js"
import { io } from "../utils/socketSetup.js";
export const ChatroomView = (req, res) => {
    res.render("chatroom");
};

export const receiveMessage = async(req, res)=>{
    const mess = new MessageObj(req.body.username, req.body.content, req.body.timestamp, req.body.status);
    const message = await mess.storeMessage()
    io.emit('chat message', mess.obj)
}

export const getMessages = async(req, res) => {
    const messages = await MessageObj.loadArchive();
    res.send({archive:messages})
}

    

  



