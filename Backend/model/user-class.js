import DAO from "./dao.js"
import { prohibitedUsernames } from '../utils/user-config.js';
import { hashPassword } from "../utils/passwordUtils.js";

class User {
    constructor( username, password, status, usertype, esp, waitlistRole, specialist) {
        this.username = username;
        this.status = status;
        this.password = password;
        this.usertype = usertype;
        this.esp = esp;
        this.waitlistRole = waitlistRole;
        this.specialist = specialist;
        
        
    }

    static get dao() {
        return DAO;
    }

    static get prohibitedUsernames() {
        return prohibitedUsernames;
    }

    static get passwordMinLength() {
        return 4;
    }

    static get usernameMinLength() {
        return 3;
    }

    static async validate(username, password) {
        // Check username length
        let check = await this.usernameExists(username);
        //
        if (check) {
            throw new Error("Username already exists");
        }

        if (!username || username.length < this.usernameMinLength) {
            
            throw new Error("Username length invalid");
        }

        // Check password length
        if (!password || password.length < this.passwordMinLength) {
            
            throw new Error("Password length invalid");
        } 

        // Check banned usernames
        if (this.prohibitedUsernames.indexOf(username) > -1) {
            
            throw new Error("Username prohibited");
        }

        return 0;
    }

    async save() {
        return await DAO.getInstance().createUser(this.username, this.password, this.status, this.usertype, this.esp, true);
    }

    static async retrieve(username) {
        const user = await DAO.getInstance().getUserByName(username);
        return user;
        
    }

    static all() {
        return DAO.getInstance().getAllUsers();
    }

    toSchemaObject() {
        return {
            username: this.username,
            password: this.password,
            status: this.status,
            online: false,
            acknowledged: false,
            usertype: this.usertype,
            esp: this.esp,
            waitlistRole: 'undefined',
            specialist: this.specialist,
            confirmGroup: [],
            useraccountstatus: 'Active',
        };
    }

    static async usernameExists(newUsername) {
        const user = await DAO.getInstance().getUserByName(newUsername);
        return !user===null;
    }

    static async hashPassword(password) {
        return await hashPassword(password);
    }
    
}

export default User;