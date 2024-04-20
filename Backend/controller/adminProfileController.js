import { hashPassword} from "../utils/passwordUtils.js"
import { prohibitedUsernames } from '../utils/user-config.js'; 
import DAO from "../model/dao.js"
import { io } from "../utils/socketSetup.js";
import User from "../model/user-class.js";
import { getSocketIds } from '../model/ActiveUser.js';

export const changeUserInfo = async (req, res)=>{
    const username = req.body.username;
    const newPassword = req.body.password;
    const userid = req.body.userid;
    const newstatus = req.body.status;
    const newusertype = req.body.usertype;
    try{
        let user = await DAO.getInstance().getUserById(userid);
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

    }catch  (err){
        if (err.message.includes("Invalid username or password") || err.message.includes("Username already exists")) {
            return res.status(400).send({ message: err.message });
        } else if (err.message.includes("User not found")) {
            return res.status(404).send({ message: err.message });
        } else {
            return res.status(500).send({ message: "Failed to update profile due to an unexpected error." });
        }
    }


}



