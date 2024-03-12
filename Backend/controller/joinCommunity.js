import { hashPassword, comparePassword } from "../utils/passwordUtils.js"
import DAO from "../model/dao.js"
import User from "../model/user-class.js";


// Define the route handler functions

export const HomeView = (req, res) => {
    res.render("home");
};

export const indexView = (req, res) => {
    res.render("index");
};
 
export async function loginRegister(user_data){
    const userExists = await DAO.getInstance().getUserByName(user_data.username);
    if (!userExists) {
        let un = user_data.username;
        const data = {
            username: un.toLowerCase(),
            password: user_data.password
        };
        const hashed_password = await hashPassword(data.password);
        const userdata = await DAO.getInstance().createUser(data.username, hashed_password, "undefined");
        // res.status(202).send({ data });
        return data;
    } else {
        //res.status(400).send({message: "User exists!"});
        return null
    }
}

export const UserConfirmation = async (req, res) => { 
    var user_confirmation_result = await loginRegister(req.body)
    if(user_confirmation_result != null){
        res.status(202).send({data: user_confirmation_result});
    }
    else{
        res.status(400).send({message: "User already exists!"});
    }
    // const userExists = await DAO.getInstance().getUserByName(req.body.username);
    // if (!userExists) {
    //     let un = req.body.username;
    //     const data = {
    //         username: un.toLowerCase(),
    //         password: req.body.password
    //     };
    //     const hashed_password = await hashPassword(data.password);
    //     const userdata = await DAO.getInstance().createUser(data.username, hashed_password, "undefined");
    //     res.status(202).send({ data });
    //     return 1
    // } else {
    //     res.status(400).send({message: "User exists!"});
    //     return 0
    // }

    
};

export const UserJoin = async (req, res) => {
    const data = {
        username: req.body.username,
        password: req.body.password
    };

    var status = 0;

    var ruleCheck = User.validate(data.username, data.password);
    if (ruleCheck) {
        res.status(400 + ruleCheck).send();
        return;
    }
    
    const userExists = await DAO.getInstance().getUserByName(data.username);

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
    const userExists = await DAO.getInstance().getUserByName(username)
    if (userExists) {
        try {
            await DAO.getInstance().updateUserAcknowledgement(username);
            res.status(200).send('Acknowledged');
        } catch (err) {
            console.log(err);
            res.status(500).send('Something went wrong!');
        }
    } else {
        res.status(404).send("User does not exist");
    }
};

