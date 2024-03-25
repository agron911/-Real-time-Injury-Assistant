import User from './user-class.js';

class Citizen extends User {
    constructor(username, password, status) {
        super(username, password, status, "Citizen");
    }
}

export default Citizen;
