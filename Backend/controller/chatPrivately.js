import DAO from "../model/dao.js"
import MessageObj from "../model/message-class.js";
import { io } from "../utils/socketSetup.js";
import { isUserActive, getSocketId } from '../model/ActiveUser.js';

export const loadUnreadMessages = async(req, res) => {
    const messages = await DAO.getUnreadMessages(req.params.username);
    res.send({archive:messages})
}

export const receivePrivateMessage = async(req, res)=>{
    const now = new Date();
    const timestamp = now.toISOString(); // Format as ISO string, e.g., "2021-03-23T18:25:43.511Z"
    new MessageObj(req.body.username, req.body.content, timestamp, req.body.status, req.body.receiver);
    const mess = await DAO.createMessage(req.body.username, req.body.content, timestamp, req.body.status, req.body.receiver, false);
    // TODO: Alert the receiver of the message
    // if the user is online, send notification to user through socket
    const userActive = await isUserActive(req.body.receiver);
    if (userActive) {
        const socketId = await getSocketId(req.body.receiver);
        const msg = await DAO.updateMessageById(mess[0]._id, {viewed: true});
        io.to(socketId).emit('private-message', msg);
    }
    // if the user is offline, update some parameter to notify the user of the message

    // io.emit('chat message', mess.obj)
    
    res.send({message: "message received"});
}

// Retrieve all private messages between two users
export const loadPrivateMessages = async(req, res) => {
    
    const messages = await DAO.getAllPrivateMessages(req.query.username1, req.query.username2);
    res.send({archive:messages})
}