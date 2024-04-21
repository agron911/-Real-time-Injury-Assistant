import DAO from "../model/dao.js"
import { io } from "../utils/socketSetup.js";

export const updateUserStatus = async (req, res) =>{
    const username = req.params.username;
    const status = req.body.status;

    await DAO.getInstance().updateUserStatus(username, status);
    io.emit('status-update', {username: username, status: status});
    try{
        res.status(200).send({message: "status updated"});
    }catch(err){
        res.status(400).send({message: "Failed to update status"+err.message});
    }
    
}


export const getStatus = async (req, res) =>{
    const userid = req.params.userid;
    try{
        const user = await DAO.getInstance().getUserById(userid);
        res.status(200).send({status: user.status});
    }catch(err){
        res.status(400).send({message: "Failed to get status"});
    }
    
}