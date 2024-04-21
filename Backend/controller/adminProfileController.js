import { hashPassword} from "../utils/passwordUtils.js"
import { prohibitedUsernames } from '../utils/user-config.js'; 
import DAO from "../model/dao.js"
import { io } from "../utils/socketSetup.js";
import User from "../model/user-class.js";
import { getSocketIds } from '../model/ActiveUser.js';

export const getUserId = async (req, res)=>{
    try{
        const user = await DAO.getInstance().getUserByName(req.params.username);
        const userid = user._id.toString();
        res.status(200).send({result:userid})
    }catch(err){
        res.status(400).send();
    }
    
}

export const changeUserInfo = async (req, res)=>{
    const username = req.body.username;
    const newPassword = req.body.password;
    const userid = req.params.userid;
    const newstatus = req.body.status;
    const newusertype = req.body.usertype;
    //console.log(req.body);
    //console.log(req.params)
    const oldusername = await DAO.getInstance().getUserById(userid).username;
    if(oldusername !=username){
        await DAO.getInstance().changeMessageUsername(userid, username)
    }
    try{
        let user = await DAO.getInstance().getUserById(userid);
        //console.log(user)
        if(!user){
            res.status(404).send({message: "User not found"});
            return;
        }

        User.validate(username, newPassword);

        const newpassword = await hashPassword(newPassword);
        
        await DAO.getInstance().changeUserInfo(userid, newstatus, username, newusertype, newpassword)

        if (newstatus === 'Inactive' && user.status !== 'Inactive') {
            const socketIds = await getSocketIds(user.username);
            io.to(socketIds).emit('logout', { message: "Your account has been deactivated. Please contact support." });
        }
        res.status(200).send({message: "change saved"})

    }catch  (err){
        if (err.message.includes("Invalid username or password") || err.message.includes("Username already exists")) {
            return res.status(400).send({ message: err.message });
        } else if (err.message.includes("User not found")) {
            return res.status(404).send({ message: err.message });
        } else {
            console.log(err)
            return res.status(500).send({ message: "Failed to update profile due to an unexpected error." });
        }
    }


}



