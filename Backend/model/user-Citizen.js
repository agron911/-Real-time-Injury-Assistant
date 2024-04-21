import DAO from './dao.js';
import User from './user-class.js';

class Citizen extends User {
    constructor(username, password, status, esp, waitlistRole, specialist) {
        super(username, password, status, "Citizen", esp, waitlistRole, specialist);
    }

    async modifyEsp(esp){
        const user = await DAO.getInstance().updateUserEsp(this.username, esp);
        const citizen = new Citizen(user.username, user.password, user.status, user.esp);
        return citizen;
    };

    static async retrieveUserByUsername(username) {
        const userSchemaObj = await User.retrieve(username);
        //console.log(userSchemaObj._id.toString())
        if(!userSchemaObj) throw new Error("User not found");
        const citizen = new Citizen(userSchemaObj.username, userSchemaObj.password, userSchemaObj.status, userSchemaObj.esp);
        return citizen;
    }
    

}

export default Citizen;