import { io } from "../utils/socketSetup.js";
import DAO from "../model/dao.js"
import { isUserActive, getSocketIds } from '../model/ActiveUser.js';



export async function loadGroupMessages(req, res) {
    try {
        const messages = await DAO.getInstance().getAllGroupMessages(req.params.group);
        res.send({ archive: messages })

    } catch (err) {
        res.status(400)
    }
}

export async function CheckConfirmation(req, res) {
    const message = await DAO.getInstance().CheckGroupConfirmation(req.params.group, req.params.username);
    if (message) {
        res.status(200).send({ message: "Confirm given" })
    } else {
        res.send({ message: "No consent" });
    }
}

export async function ConfirmGroup(req, res) {
    const message = await DAO.getInstance().ConfirmGroup(req.params.group, req.params.username);
    if (message) {
        res.status(200).send({ message: "Confirm given" })
    } else {
        res.send({ message: "No consent" });
    }
}


export async function receiveGroupMessage(req, res) {
    const timestamp = new Date().toString();
    // new MessageObj(req.body.username, req.body.content, req.body.timestamp, req.body.status, req.body.receiver, req.body.group);
    const mess = await DAO.getInstance().createGroupMessage(req.body.username, req.body.content, timestamp, req.body.status, req.body.receiver, false, req.body.group);
    const users = await DAO.getInstance().getGroupUsers(req.body.group);
    let notificationsSent = 0;
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
                // check if the specialist is active

                const socketIds = await getSocketIds(user.username);
                if (count_specialist <= 0) {
                    const msg = await DAO.getInstance().updateMessageById(mess[0]._id, { viewed: false });
                    socketIds.forEach(socketId => {
                        io.to(socketId).emit('group-message', { msg: msg, specialist_online: false });
                    });
                } else {
                    const msg = await DAO.getInstance().updateMessageById(mess[0]._id, { viewed: true });
                    socketIds.forEach(socketId => {
                        io.to(socketId).emit('group-message', { msg: msg, specialist_online: true });
                    });
                }
            } else if (UserActive) {
                const socketIds = await getSocketIds(user.username);
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
            res.status(500).send({ error: "An error occurred." });
        }
    }

}


export async function getSpecialists(req, res) {
    try {
        const specialists = await DAO.getInstance().getSpecialists(req.params.group);
        res.send({ specialists })
    } catch (err) {
        res.status(400)
    }
}


export async function editGroupMessage(req, res) {
    const message = await DAO.getInstance().updateMessageById(req.params.messageId, req.body);
    const users = await DAO.getInstance().getGroupUsers(req.body.group);
    let notificationsSent = 0;
    try {
        for (const user of users) {
            const userActive = await isUserActive(user.username);

            if (userActive) {
                const socketIds = await getSocketIds(user.username);
                socketIds.forEach(socketId => {
                    io.to(socketId).emit('edit-group-message', message);
                });
                notificationsSent++;
            }
        }
    } catch (err) {
        if (!res.headersSent) {
            res.status(500).send({ error: "An error occurred." });
        }
    }
    res.send({ message })
}


export async function deleteGroupMessage(req, res) {
    const messageId = req.body.messageId;
    const users = await DAO.getInstance().getGroupUsers(req.body.group);

    try {
        const message = await DAO.getInstance().deleteMessageById(messageId);
        for (const user of users) {
            const userActive = await isUserActive(user.username);

            if (userActive) {
                const socketIds = await getSocketIds(user.username);
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