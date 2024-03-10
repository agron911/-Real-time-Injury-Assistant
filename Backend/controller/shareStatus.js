import DAO from "../model/dao.js"
import { io } from "../utils/socketSetup.js";

export const updateUserStatus = async (req, res) =>{
    const username = req.params.username;
    const status = req.body.status;
    console.log("before update status");

    await DAO.updateUserStatus(username, status);
    console.log("after update status");
    const users = await DAO.getAllUsers();
    console.log("after all user");

    io.emit('updateUserList', users);
    
    res.status(200);
}


