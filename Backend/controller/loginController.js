import jwt from 'jsonwebtoken';
import { getUserByName, setUserOnline, setUserOffline } from '../model/User.js';

export const login = async(req, res) => {
    console.log('da', req.body)
    const user = await getUserByName(req.body.username);
    if(user) {
        const jwtToken = jwt.sign({ id: user.id, username: user.username}, process.env.JWT_SECRET, { expiresIn: '1h' });
        await setUserOnline(user.username);
        res.status(200).send({token: "Bearer " + jwtToken});
    } else {
        res.status(404).send({message: 'User not found'});
    }
}

export const logout = async(req, res) => {
    const user = await getUserByName(req.body.username);
    if (user) {
        await setUserOffline(user.username);
        res.status(200).send({});
    } else {
        res.status(404).send({message: 'User not found'});
    }
}