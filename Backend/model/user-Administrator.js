import User from './user-class.js';

class Administrator extends User {
    constructor(username, password, status) {
        super(username, password, status, "Administrator");
        // Additional initialization for NormalCitizen
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

export default Administrator;
