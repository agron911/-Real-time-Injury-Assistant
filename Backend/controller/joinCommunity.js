import { hashPassword, comparePassword } from "../utils/passwordUtils.js"
import DAO from "../model/dao.js"
import User from "../model/user-class.js";
import Citizen from "../model/user-Citizen.js";


// Define the route handler functions

 

export const HomeView = (req, res) => {
    const data = { 
        title: "SA1 ESN Community", 
    };
    res.render("home", {data});
};

export const indexView = (req, res) => {
    const data = { 
        title: "SA1 ESN", 
    };
    res.render("index", {data});
};
 
export async function loginRegister(user_data){
    const userExists = await DAO.getInstance().getUserByName(user_data.username);
    if (userExists && userExists.useraccountstatus == "Inactive") {
        return ("User is inactive");
    }
    const check = userExists === null;

    if(user_data.username ==  "ESNAdmin" && check){
        await DAO.getInstance().createUser(user_data.username.toLowerCase(),  await hashPassword('admin'), "ok",'administrator', false, 'undefined',user_data.specialists);
        await DAO.getInstance().updateUserAcknowledgement(user_data.username);
        return null;
    }
    if (check) {
        let un = user_data.username;
        const data = {
            username: un.toLowerCase(),
            password: user_data.password
        };
        const hashed_password = await hashPassword(data.password);
        let newuser = await DAO.getInstance().createUser(data.username, hashed_password,"ok",'Citizen', false, 'undefined',user_data.specialists);
        data.userid = newuser._id.toString();
        return data;
    }else {
        //res.status(400).send({message: "User exists!"});
        return null
    }
}

export const UserConfirmation = async (req, res) => { 
    
    let user_confirmation_result = await loginRegister(req.body)
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
    try{
        await User.validate(data.username, data.password);
    }
    catch (err){
        if(err.message =="Username length invalid"){
            res.status(401).send({message: "Username length invalid"});
            return;
        }
        if(err.message =="Password length invalid"){
            res.status(402).send({message: "Password length invalid"});
            return;
        }
        if(err.message =="Username prohibited"){
            res.status(403).send({message: "Username prohibited"});
            return;
        }
    }

    // if (ruleCheck) {
    //     res.status(400 + ruleCheck).send();
    //     return;
    // }
    
    const userExists = await DAO.getInstance().getUserByName(data.username);
    if (userExists) {
        const hashed_password = await hashPassword(data.password);
        console.log("userExists: ", userExists, hashed_password, await comparePassword(userExists.password, data.password));
        const isPasswordCorrect = await comparePassword(userExists.password, data.password, hashed_password);
        if (isPasswordCorrect) {
            res.status(206).send({message: "Join successful"});
        } else {
            res.status(400).send({message: 'Password mismatch'});
        }
    } else {
        res.status(201).send({message: 'User does not exist'});

    }
};

export const UserAcknowledgement = async (req, res) => {
    const username = req.body.username;
    const userExists = await DAO.getInstance().getUserByName(username)
    if (userExists) {
        try {
            await DAO.getInstance().updateUserAcknowledgement(username);
            res.status(200).send({message: "Acknowledged"});
        } catch (err) {
            
            res.status(500).send('Something went wrong!');
        }
    } else {
        res.status(400).send({message:"User does not exist"});
    }
};