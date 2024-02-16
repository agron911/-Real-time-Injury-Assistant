import mongoose from 'mongoose'
const activeUserSchema = new mongoose.Schema({
    username:{
        type: String,
        required: true
    },
    socketId:{
        type:String,
        required: true
    }
})

const ActiveUser = mongoose.model('ActiveUser', activeUserSchema)


export async function addActiveUser(username, socketid){
    const activeuser = await ActiveUser.insertMany({username: username, socketId:sockeid})
    return activeuser
}

export default ActiveUser