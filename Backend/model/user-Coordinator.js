import User from './user-class.js';

class Coordinator extends User {
    constructor(username, password, status) {
        super(username, password, status, "Coordinator");
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

export default Coordinator;
