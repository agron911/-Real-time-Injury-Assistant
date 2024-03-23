import MessageObj from "../model/message-class.js";
import { io } from "../utils/socketSetup.js";
import DAO from "../model/dao.js"

export const receiveAnnouncementMessage = async(req, res)=>{
    const mess = new MessageObj(req.body.username, req.body.content, req.body.timestamp, req.body.status, req.body.receiver);
    await DAO.getInstance().createMessage(req.body.username, req.body.content, req.body.timestamp, req.body.status, req.body.receiver, true);
    io.emit('chat message', mess.obj)

    res.send({message: "message received"})
}

export const loadAnnouncementMessages = async(req, res) => {
    const messages = await DAO.getInstance().getAllMessages("announcement");
    res.send({archive:messages})
}



    

  



