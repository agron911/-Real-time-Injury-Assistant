import DAO from "../model/dao.js"
import MessageObj from "../model/message-class.js";
import { io } from "../utils/socketSetup.js";
import { isUserActive, getSocketIds } from '../model/ActiveUser.js';

export const loadUnreadMessages = async(req, res) => {
    try{
        const messages = await DAO.getInstance().getUnreadMessages(req.query.username);
        res.status(200).send({archive:messages});
    }catch(err){
        res.status(400).send({message: "Error in loading unread messages"});
    }
}

export const receivePrivateMessage = async(req, res)=>{
    let receiveruser = await DAO.getInstance().getUserByName(req.body.receiver);
    
    let receiveruserid = receiveruser._id.toString();
    const timestamp = new Date().toString(); 
    new MessageObj(req.body.userid, receiveruserid, req.body.username, req.body.content, req.body.timestamp, req.body.status, req.body.receiver);
    const mess = await DAO.getInstance().createMessage(req.body.userid, receiveruserid, req.body.username, req.body.content, timestamp, req.body.status, req.body.receiver, false);

    // if the user is online, send notification to user through socket
    const userActive = await isUserActive(req.body.receiver);
    if (userActive) {
        const socketIds = await getSocketIds(receiveruserid);
        console.log("socketIds: " + socketIds);
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
    // res.status(200).send({archive: "messages"})
    // return;
    try{
        console.log(req.query.username1, req.query.username2)
        const user1 = await DAO.getInstance().getUserByName(req.query.username1);
        const user2 = await DAO.getInstance().getUserByName(req.query.username2);
        console.log(user1._id.toString(), user2._id.toString());
        // if(!user1 || !user2 ) {
        //     res.status(300).send({user1, user2})
        //     return;
        // }
        let messages = await DAO.getInstance().getAllPrivateMessages(user1._id.toString(), user2._id.toString());
    
        messages = await Promise.all(messages.map(async (message) => {
            // console.log("dsda");
            const user = await DAO.getInstance().getUserById(message.userid);
            return {
                ...message._doc,
                username: user.username,
            }; 
        }));
        // console.log("messages", messages);
        res.status(200).send({archive: messages})
    }catch(err){
        res.status(400).send({message: "Error in loading all private messages"});
    }
    // console.log("herrrr");
}