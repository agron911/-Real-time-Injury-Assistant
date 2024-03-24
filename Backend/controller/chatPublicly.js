
import MessageObj from "../model/message-class.js";
import { io } from "../utils/socketSetup.js";
import DAO from "../model/dao.js"

export const ChatroomView = (req, res) => {
    const data = {
        title: "SA1 ESN Community",
    };
    res.render("chatroom", { data });
};

export const receivePublicMessage = async (req, res) => {

    const mess = new MessageObj(req.body.username, req.body.content, req.body.timestamp, req.body.status, req.body.receiver);
    try {
        await DAO.getInstance().createMessage(req.body.username, req.body.content, req.body.timestamp, req.body.status, req.body.receiver, true);
        io.emit('chat message', mess.obj)
        res.send({ message: "message received" })
    } catch (err) {
        if (err.message === "Create Message database failure"){
            res.status(400).send({ error: "Create Message database failure" })
        }else{
            res.status(401).send({ error: "broadcast failure" })
        }
    }
}


export const loadPublicMessages = async (req, res) => {
    const messages = await DAO.getInstance().getAllMessages("all");
    res.send({ archive: messages })
}









