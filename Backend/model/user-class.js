import DAO from "./dao.js"
import { prohibitedUsernames } from '../utils/user-config.js';

class User {
    constructor(username, password, status, usertype, esp, validate) {
        if (validate && User.validate(username, password)) throw "Invalid username or password"

        this.username = username;
        this.status = status;
        this.password = password;
        this.usertype = usertype;
        this.esp = esp;

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

    static validate(username, password) {
        // Check username length
        if (!username || username.length < this.usernameMinLength) {
            console.log(`Username must be at least 3 characters long.`);
            throw new Error("Username length invalid");
        }

        // Check password length
        if (!password || password.length < this.passwordMinLength) {
            console.log(`Your password must be at least 4 characters long. Passwords are case sensitive!`);
            throw new Error("Password length invalid");
        } 

        // Check banned usernames
        if (this.prohibitedUsernames.indexOf(username) > -1) {
            console.log(`Your username is prohibited. Try again.`);
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
        };
    }
}

export default User;