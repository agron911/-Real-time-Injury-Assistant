import { hashPassword } from "../utils/passwordUtils.js"
import DAO from "../model/dao.js"
import { io } from "../utils/socketSetup.js";
import User from "../model/user-class.js";
import { getSocketIds } from '../model/ActiveUser.js';

export const getUserId = async (req, res) => {
    try {
        const user = await DAO.getInstance().getUserByName(req.params.username);
        const userid = user._id.toString();
        res.status(200).send({ result: userid })
    } catch (err) {
        res.status(400).send();
    }

}

export const changeUserInfo = async (req, res) => {
    let username = req.body.username.toLowerCase();
    let newPassword = req.body.password;
    const userid = req.body.id;
    let newstatus = req.body.status;
    let newusertype = req.body.usertype;
    try {
        let user = await DAO.getInstance().getUserById(userid);
        //
        if (!user) {
            res.status(404).send({ message: "User not found" });
            return;
        }

        if (username !== user.username) {
            username = username.toLowerCase();
        }
        if (newPassword !== "") {
            newPassword = await hashPassword(newPassword);
        } else {

            newPassword = user.password;
        }
        if ((newusertype !== 'Administrator' && user.usertype === 'Administrator') || (newusertype === 'Administrator' && newstatus === 'Inactive')) {
            const administrators = await DAO.getInstance().getAdministrators();

            if (administrators.length === 1) {
                res.status(400).send({ message: "There must be at least one administrator active." });
                return;
            }
        }


        await DAO.getInstance().changeUserInfo(userid, newstatus, username, newusertype, newPassword)

        if (newstatus === 'Inactive' && user.status !== 'Inactive') {
            const socketIds = await getSocketIds(userid);
            io.to(socketIds).emit('inactive-logout', { message: "Your account has been deactivated. Please contact support." });
        }
        const newUser = await DAO.getInstance().getUserById(userid);
        res.status(200).send({ data: { message: "User information updated successfully", user: newUser } });

    } catch (err) {
        if (err.message.includes("Invalid username or password") || err.message.includes("Username already exists")) {
            return res.status(400).send({ message: err.message });
        } else if (err.message.includes("User not found")) {
            return res.status(404).send({ message: err.message });
        } else {
            //
            return res.status(500).send({ message: "Failed to update profile due to an unexpected error." });
        }
    }


}




export const getUserProfile = async (req, res) => {
    try {
        const user = await DAO.getInstance().getUserById(req.params.id);
        if (user) {
            res.status(200).send(user);
        } else {
            res.status(404).send({ message: "User not found" });
        }
    }
    catch (err) {
        res.status(500).send({ message: "Failed to get user profile" });
    }
}

export const UserActionValidation = async (req, res) => {
    try {
        const user = await DAO.getInstance().getUserById(req.params.id);
        if (user) {
            res.status(200).send({ data: user.usertype });
        } else {
            res.status(404).send({ message: "User not found" });
        }
    }
    catch (err) {
        res.status(500).send({ message: "Failed to get user profile" });
    }
}