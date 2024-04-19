import User from './user-class.js';

class Administrator extends User {
    constructor(username, password, status, waitlistRole, specialist) {
        super(username, password, status, "Administrator", false, waitlistRole, specialist);
        // Additional initialization for NormalCitizen
    }
    
}

export default Administrator;