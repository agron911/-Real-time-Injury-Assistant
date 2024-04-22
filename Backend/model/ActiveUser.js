import mongoose from 'mongoose'
const activeUserSchema = new mongoose.Schema({
    userid:{
        type: String,
        required: true
    },
    username:{
        type: String,
        required: true
    },
    socketId:{
        type:String,
        required: true,
    },
    esp:{
        type:Boolean,
        required: true,
    }
})

const ActiveUser = mongoose.model('ActiveUser', activeUserSchema)


export async function addActiveUser(userid,username, socketid, esp){
    
    const activeuser = await ActiveUser.insertMany({userid:userid,username: username, socketId:socketid, esp: esp});
    return activeuser;
}


export const removeSocketAndgetUserName = async (socketid) => {
    const activeUser = await ActiveUser.findOne({socketId: socketid});
    if(activeUser){
        await ActiveUser.deleteOne({socketId: socketid});
        return activeUser.username;
    }
}

export const isUserActive = async (username) => {
    const activeUsers = await ActiveUser.find({username: username});
    if (activeUsers.length == 0) {
        return false;
    } else {
        return true;
    }
}

export const deActivateUser = async (username) => {
    await ActiveUser.deleteMany({username: username});
}

export const getSocketIds = async (userid) => {
    const activeUsers = await ActiveUser.find({userid: userid});
    if (activeUsers.length > 0) {
        return activeUsers.map((activeUser)=>activeUser.socketId);
    }
}

export const getEspSocketIds = async () => {
    const activeUsers = await ActiveUser.find({esp: true});
    if (activeUsers.length > 0) {
        return activeUsers.map((activeUser)=>activeUser.socketId);
    }
}
export default ActiveUser