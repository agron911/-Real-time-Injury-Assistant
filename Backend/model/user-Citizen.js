import User from './user-class.js';

class Citizen extends User {
    constructor(username, password, status, specialists) {
        super(username, password, status, "Citizen", specialists);
    }
}

export default Citizen;