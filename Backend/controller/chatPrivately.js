import DAO from "../model/dao.js"
import MessageObj from "../model/message-class.js";
import { io } from "../utils/socketSetup.js";
import { isUserActive, getSocketId } from '../model/ActiveUser.js';

export const loadUnreadMessages = async(req, res) => {
    const messages = await DAO.getUnreadMessages(req.body.username);
    res.send({archive:messages})
}

export const receivePrivateMessage = async(req, res)=>{
    const mess = new MessageObj(req.body.username, req.body.content, req.body.timestamp, req.body.status, req.body.receiver);
    await DAO.createMessage(req.body.username, req.body.content, req.body.timestamp, req.body.status, req.body.receiver, false);
    // TODO: Alert the receiver of the message
    // if the user is online, send notification to user through socket
    if (isUserActive(req.body.receiver)) {
        const socketId = getSocketId(req.body.receiver);
        io.to(socketId).emit('private message', mess.obj);
    }
    // if the user is offline, update some parameter to notify the user of the message

    // io.emit('chat message', mess.obj)

    res.send({message: "message received"})
}

// Retrieve all private messages between two users
export const loadPrivateMessages = async(req, res) => {
    const messages = await DAO.getAllPrivateMessages(req.body.username, req.body.receiver);
    res.send({archive:messages})
}