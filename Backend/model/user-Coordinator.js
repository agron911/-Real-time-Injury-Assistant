import User from './user-class.js';

class Coordinator extends User {
    constructor(username, password, status, waitlistRole, specialist) {
        super(username, password, status, "Coordinator", false, waitlistRole, specialist);
    }
    
}

export default Coordinator;