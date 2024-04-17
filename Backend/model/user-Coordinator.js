import User from './user-class.js';

class Coordinator extends User {
    constructor(username, password, status) {
        super(username, password, status, "Coordinator", false);
    }
    
}

export default Coordinator;