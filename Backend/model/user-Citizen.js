import User from './user-class.js';

class Citizen extends User {
    constructor(username, password, status) {
        super(username, password, status, "Citizen");
    }

    toSchemaObject() {
        return {
            username: this.username,
            password: this.password,
            status: this.status,
            online: false,
            acknowledged: false, 
            usertype: this.usertype 
        };
    }
}

export default Citizen;
