
import MessageObj from "../model/message-class.js";
import { io } from "../utils/socketSetup.js";
import DAO from "../model/dao.js"

export const ChatroomView = (req, res) => {
    res.render("chatroom");
};

export const receiveMessage = async(req, res)=>{
    const mess = new MessageObj(req.body.username, req.body.content, req.body.timestamp, req.body.status, req.body.receiver);
    await DAO.createMessage(req.body.username, req.body.content, req.body.timestamp, req.body.status, req.body.receiver);
    io.emit('chat message', mess.obj)

    res.send({message: "message received"})
}

export const loadPublicMessages = async(req, res) => {
    const messages = await DAO.getAllMessages("all");
    res.send({archive:messages})
}

export const loadPrivateMessages = async(req, res) => {
    const messages = await DAO.getAllPrivateMessages(req.body.username, req.body.receiver);
    res.send({archive:messages})
}

    

  



