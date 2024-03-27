import User from './user-class.js';

class Administrator extends User {
    constructor(username, password, status) {
        super(username, password, status, "Administrator");
        // Additional initialization for NormalCitizen
    }
    
}

export default Administrator;