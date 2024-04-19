// UserFactory.js
import User from './user-class.js';
import Administrator from './user-Administrator.js';
import Coordinator from './user-Coordinator.js';
import Citizen from './user-Citizen.js';

class UserFactory {
    static createUser(type, username, password, status, esn, waitlistRole, specialist) {
        switch (type) {
            case 'administrator':
                return new Administrator(username, password, status, waitlistRole, specialist);
            case 'coordinator':
                return new Coordinator(username, password, status, waitlistRole, specialist);
            case 'citizen':
            default:
                return new Citizen(username, password, status, esn, waitlistRole, specialist);
        }
    }
}   
export default UserFactory;