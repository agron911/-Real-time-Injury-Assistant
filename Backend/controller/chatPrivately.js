import DAO from "../model/dao.js"
import MessageObj from "../model/message-class.js";
import { io } from "../utils/socketSetup.js";
import { isUserActive, getSocketIds } from '../model/ActiveUser.js';

export const loadUnreadMessages = async(req, res) => {
    const messages = await DAO.getInstance().getUnreadMessages(req.query.username);
    try{
        res.status(200).send({archive:messages});
    }catch(err){
        res.status(400).send({message: "Error in loading unread messages"});
    }
}

export const receivePrivateMessage = async(req, res)=>{
    let receiveruser = await DAO.getInstance().getUserByName(req.body.receiver);
    let receiveruserid = receiveruser._id.toString()
    console.log(req.body);
    const timestamp = new Date().toString(); 
    new MessageObj(req.body.userid, receiveruserid, req.body.username, req.body.content, req.body.timestamp, req.body.status, req.body.receiver);
    const mess = await DAO.getInstance().createMessage(req.body.userid, receiveruserid, req.body.username, req.body.content, timestamp, req.body.status, req.body.receiver, false);

    // if the user is online, send notification to user through socket
    const userActive = await isUserActive(req.body.receiver);
    if (userActive) {
        const socketIds = await getSocketIds(req.body.receiver);
        const msg = await DAO.getInstance().updateMessageById(mess[0]._id, {viewed: true});
        socketIds.forEach(socketId => {
            io.to(socketId).emit('private-message', msg);            
        });
    }
    // if the user is offline, update some parameter to notify the user of the message

    // io.emit('chat message', mess.obj)
    
    res.send({message: "message received"});
}

// Retrieve all private messages between two users
export const loadPrivateMessages = async(req, res) => {
    const messages = await DAO.getInstance().getAllPrivateMessages(req.query.username1, req.query.username2);
    try{
        res.status(200).send({archive:messages})
    }catch(err){
        res.status(400).send({message: "Error in loading all private messages"});
    }
}