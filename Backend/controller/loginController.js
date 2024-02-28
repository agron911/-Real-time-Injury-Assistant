import jwt from 'jsonwebtoken';
import { getUserByName, setUserOnline, setUserOffline, getAllUsers } from '../model/User.js';
import { addActiveUser, deActivateUser, isUserActive, removeSocketAndgetUserName } from '../model/ActiveUser.js';
import { io } from "../utils/socketSetup.js";

export const loginOrLogout = async (req, res) => {
    const isOnline = req.body.isOnline
    if (isOnline) {
        login(req, res);
    } else {
        logout(req, res);
    }
}

export const login = async (req, res) => {
    const user = await getUserByName(req.body.username);
    if (user) {
        const jwtToken = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });
        await setUserOnline(user.username);
        io.emit('updateUserList');
        res.status(200).send({ token: "Bearer " + jwtToken });
    } else {
        res.status(404).send({ message: 'User not found' });
    }
}

// Set the user status to offline, delete all socketIds from ActiveUser table
export const logout = async (req, res) => {
    const user = await getUserByName(req.body.username);
    if (user) {
        await setUserOffline(user.username);
        await deActivateUser(user.username);
        io.emit('updateUserList');
        res.status(200).send({});
    } else {
        res.status(404).send({ message: 'User not found' });
    }
}

export const registerUserSocket = async (req, res) => {
    const username = req.params.username;
    const user = await getUserByName(username);
    if (user) {
        await addActiveUser(username, req.body.socketId);
        await setUserOnline(username);
        const users = await getAllUsers();
        io.emit('updateUserList');
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
        await setUserOffline(username);
        io.emit('updateUserList');
    }
}


export const getUsers = async (req, res) => {
    try {
        const users = await getAllUsers(); 
        res.json({ users }); 
    } catch (error) {
        console.error('Failed to get users:', error);
        res.status(500).send({ message: 'Failed to get users' });
    }
}

