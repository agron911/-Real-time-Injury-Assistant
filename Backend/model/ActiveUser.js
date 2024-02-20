import mongoose from 'mongoose'
const activeUserSchema = new mongoose.Schema({
    username:{
        type: String,
        required: true
    },
    socketId:{
        type:String,
        required: true,
    }
})

const ActiveUser = mongoose.model('ActiveUser', activeUserSchema)


export async function addActiveUser(username, socketid){
    const activeuser = await ActiveUser.insertMany({username: username, socketId:socketid});
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

export default ActiveUser