import DAO from "../model/dao.js"
import { io } from "../utils/socketSetup.js";

export const updateUserStatus = async (req, res) =>{
    const username = req.params.username;
    const status = req.body.status;

    await DAO.updateUserStatus(username, status);
    const users = await DAO.getAllUsers();

    io.emit('updateUserList', users);
    io.emit('status-update', {username: username, status: status});
    res.status(200).send({message: "status updated"});
}


export const getStatus = async (req, res) =>{
    const username = req.params.username;
    const user = await DAO.getUserByName(username);
    res.status(200).send({status: user.status});
}