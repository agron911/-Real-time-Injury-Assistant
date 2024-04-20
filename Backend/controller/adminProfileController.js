import { hashPassword} from "../utils/passwordUtils.js"
import { prohibitedUsernames } from '../utils/user-config.js'; 
import DAO from "../model/dao.js"
import { io } from "../utils/socketSetup.js";

function validate(username, password){
    const usernameminlength =3;
    const passwordminlength = 4;
    if (!username || username.length < usernameminlength){
        console.log("bad username")
        return -1;
    }
    if (!password || password.length < passwordminlength ) {
        console.log("bad password")
        return -1;
    } 
    if (prohibitedUsernames.indexOf(username) > -1) {
        console.log("prohibited username")
        return -1;
    }
    return 0;
}

export async function changeUserInfo(req, res){
    //console.log(req.body)
    if(validate(req.body.username, req.body.password)<0){
        res.status(400).send({message: "Validation failed"});
        return;
    }
    else{
        let newpassword = await hashPassword(req.body.password);
        DAO.getInstance().changeUserInfo(req.body.userid, req.body.useraccountstatus, req.body.username, req.body.priviledge, newpassword)
        res.status(200).send({message: "change saved"});
        return
    }
}



