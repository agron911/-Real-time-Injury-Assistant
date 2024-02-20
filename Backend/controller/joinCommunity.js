import { isValid, getUserByName, createUser, UpdateAcknowledgement } from '../model/User.js'
import { hashPassword, comparePassword } from "../utils/passwordUtils.js";


// Define the route handler functions

export const HomeView = (req, res) => {
    res.render("home");
};

export const indexView = (req, res) => {
    res.render("index");
};
 

export const UserConfirmation = async (req, res) => {
    
    const userExists = await getUserByName(req.body.username);
    if (!userExists) {
        let un = req.body.username;
        const data = {
            username: un.toLowerCase(),
            password: req.body.password
        };
        const hashed_password = await hashPassword(data.password);
        const userdata = await createUser(data.username, hashed_password);
        res.status(202).send({ data });
    } else {
        res.status(400).send({message: "User exists!"});
    }

    
};

export const UserJoin = async (req, res) => {
    const data = {
        username: req.body.username,
        password: req.body.password
    };

    var status = 0;

    var ruleCheck = isValid(data.username, data.password);
    if (ruleCheck) {
        res.status(400 + ruleCheck).send();
        return;
    }
    
    const userExists = await getUserByName(data.username);

    if (userExists) {
        const hashed_password = await hashPassword(data.password);
        const isPasswordCorrect = await comparePassword(userExists.password, data.password, hashed_password);
        if (isPasswordCorrect) {
            status = 205;
        } else {
            status = 400;
        }
    } else {
        status = 201;
    }
    res.status(status).send();
};

export const UserAcknowledgement = async (req, res) => {
    const username = req.body.username;
    const userExists = await getUserByName(username)
    if (userExists) {
        try {
            await UpdateAcknowledgement(username);
            res.status(200).send('Acknowledged');
        } catch (err) {
            console.log(err);
            res.status(500).send('Something went wrong!');
        }
    } else {
        res.status(404).send("User does not exist");
    }
};

