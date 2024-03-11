
import MessageObj from "../model/message-class.js";
import { io } from "../utils/socketSetup.js";
import DAO from "../model/dao.js"

export const ChatroomView = (req, res) => {
    res.render("chatroom");
};

export const receiveMessage = async(req, res)=>{
    const mess = new MessageObj(req.body.username, req.body.content, req.body.timestamp, req.body.status);
    await DAO.createMessage(req.body.username, req.body.content, req.body.timestamp, req.body.status);
    io.emit('chat message', mess.obj)

    res.send({message: "message received"})
}

export const loadMessages = async(req, res) => {
    const messages = await DAO.getAllMessages();
    res.send({archive:messages})
}

    

  



