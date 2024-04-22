import { io } from "../utils/socketSetup.js";
import DAO from "../model/dao.js"
import { isUserActive, getSocketIds } from '../model/ActiveUser.js';



export const loadGroupMessages = async (req, res) => {
    try {
        const messages = await DAO.getInstance().getAllGroupMessages(req.params.group);
        res.send({ archive: messages })

    } catch (err) {
        res.status(400)
    }
}

export const CheckConfirmation = async (req, res) => {
    const message = await DAO.getInstance().CheckGroupConfirmation(req.params.group, req.params.username);
    if (message) {
        res.status(200).send({ message: "Confirm given" })
    } else {
        res.send({ message: "No consent" });
    }
}

export const ConfirmGroup = async (req, res) => {
    const message = await DAO.getInstance().ConfirmGroup(req.params.group, req.params.username);
    if (message) {
        res.status(200).send({ message: "Confirm given" })
    } else {
        res.send({ message: "No consent" });
    }
}


export const receiveGroupMessage = async (req, res) => {
    const timestamp = new Date().toString();
    // new MessageObj(req.body.username, req.body.content, req.body.timestamp, req.body.status, req.body.receiver, req.body.group);
    const mess = await DAO.getInstance().createGroupMessage(req.body.userid, req.body.username, req.body.content, timestamp, req.body.status, req.body.receiver, false, req.body.group);
    const users = await DAO.getInstance().getGroupUsers(req.body.group);
    let notificationsSent = 0;
    let view = false;
    try {
        let count_specialist = [];
        const specialists = await DAO.getInstance().getSpecialists(req.body.group);
        for (const specialist of specialists) {
            const specialistActive = await isUserActive(specialist);
            if (specialistActive) {
                
                count_specialist++;
            }
        }

        for (const user of users) {
            const UserActive = await isUserActive(user.username);

            if (user.username == req.body.username) {

                const socketIds = await getSocketIds(user._id);
                let view = false
                if (count_specialist > 0) {
                    view = true;
                } 
                const msg = await DAO.getInstance().updateMessageById(mess[0]._id, { viewed: view });
                socketIds.forEach(socketId => {
                    io.to(socketId).emit('group-message', { msg: msg, specialist_online: view });
                });
            } else if (UserActive) {

                const socketIds = await getSocketIds(user._id);
                const msg = await DAO.getInstance().updateMessageById(mess[0]._id, { viewed: true });
                socketIds.forEach(socketId => {
                    io.to(socketId).emit('group-message', { msg: msg, specialist_online: true });
                });
                notificationsSent++;
            }
        }
        res.send({ message: "message received" });
    }
    catch (err) {
        if (!res.headersSent) {
            res.status(500).send({ error: "An error occurred."+err.message   });
        }
    }

}


export const getSpecialists = async (req, res) => {
    try {
        const specialists = await DAO.getInstance().getSpecialists(req.params.group);
        res.send({ specialists })
    } catch (err) {
        res.status(400)
    }
}


export const editGroupMessage = async (req, res) => {

    try {
        const message = await DAO.getInstance().updateMessageById(req.params.messageId, req.body);
        const users = await DAO.getInstance().getGroupUsers(req.body.group);
        let notificationsSent = 0;
        for (const user of users) {
            const userActive = await isUserActive(user.username);

            if (userActive) {
                console.log("userActive", user);
                const socketIds = await getSocketIds(user._id);
                socketIds.forEach(socketId => {
                    io.to(socketId).emit('edit-group-message', message);
                });
                notificationsSent++;
            }
        }
        res.send({ message })
    } catch (err) {
        if (!res.headersSent) {
            res.status(400).send({ error: "Update error" });
        }
    }
}


export const deleteGroupMessage = async (req, res) => {
    const messageId = req.body.messageId;
    const users = await DAO.getInstance().getGroupUsers(req.body.group);
    try {
        const message = await DAO.getInstance().deleteMessageById(messageId);
        for (const user of users) {
            const userActive = await isUserActive(user.username);
            if (userActive) {
                const socketIds = await getSocketIds(user._id);
                socketIds.forEach(socketId => {
                    io.to(socketId).emit('delete-group-message', messageId);
                });
            }
        }
        res.send({ message })
    } catch (err) {
        res.status(400)
    }
}