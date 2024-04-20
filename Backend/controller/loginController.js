import jwt from 'jsonwebtoken';
import { addActiveUser, deActivateUser, isUserActive, removeSocketAndgetUserName } from '../model/ActiveUser.js';
import { io } from "../utils/socketSetup.js";
import DAO from '../model/dao.js';
import Citizen from '../model/user-Citizen.js';

export const loginOrLogout = async (req, res) => {
    const isOnline = req.body.isOnline
    if (isOnline) {
        login(req, res);
    } else {
        logout(req, res);
    }
}

export const login = async (req, res) => {
    const user = await DAO.getInstance().getUserByName(req.body.username);
    if (user) {
        const jwtToken = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET?process.env.JWT_SECRET:"test_secret", { expiresIn: '1h' });
        await DAO.getInstance().updateUserOnline(user.username);
        const users = await DAO.getInstance().getAllUsers();
        io.emit('updateUserList', users);
        res.status(200).send({ token: "Bearer " + jwtToken, userid: user._id.toString()});
    } else {
        res.status(404).send({ message: 'User not found' });
    }
}

// Set the user status to offline, delete all socketIds from ActiveUser table
export const logout = async (req, res) => {
    const user = await DAO.getInstance().getUserByName(req.body.username);
    if (user) {
        await DAO.getInstance().updateUserOffline(user.username);
        await deActivateUser(user.username);
        const users = await DAO.getInstance().getAllUsers();
        io.emit('updateUserList', users );
        res.status(200).send({});
    } else {
        res.status(404).send({ message: 'User not found' });
    }
}

export const registerUserSocket = async (req, res) => {
    const username = req.params.username;
    const user = await DAO.getInstance().getUserByName(username);
    if (user) {
        await addActiveUser(username, req.body.socketId, req.body.esp?true:false);
        await DAO.getInstance().updateUserOnline(username);
        const users = await DAO.getInstance().getAllUsers();
        io.emit('updateUserList', users );
        
        res.status(200).send({});
    } else {
        res.status(404).send({ message: 'User not found' });
    }
}


// Remove socket and if user has no other records left, mark User as offline
export const deregisterUserSocket = async (socketId) => {
    const username = await removeSocketAndgetUserName(socketId);
    const isUserActiveCurrently = await isUserActive(username);
    if (!isUserActiveCurrently) {
        DAO.getInstance().updateUserOffline(username);
        const users = await DAO.getInstance().getAllUsers();
        io.emit('updateUserList', users);

    }
}


export const getUsers = async (req, res) => {
    try {
        const users = await DAO.getInstance().getAllUsers(); 
        res.json({ users }); 
    } catch (error) {
        console.error('Failed to get users:', error.message);
        res.status(500).send({ message: 'Failed to get users' });
    }
}

export const getUser = async (req, res) => {
    try{
        const citizen = await Citizen.retrieveUserByUsername(req.params.username);
        res.status(200).send(citizen);
    } catch (error) {
        res.status(404).send(error.message);
    }
}