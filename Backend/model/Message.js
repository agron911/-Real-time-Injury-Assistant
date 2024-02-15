import mongoose from 'mongoose'
import Date from 'datetime'
const messageSchema  = new mongoose.Schema({
    username:{
        type: String,
        required: true
    },
    content:{
        type: String,
        required: true
    },
    timestamp:{
        type: Date,
        required: true
    },
    messageId:{
        type:String,
        required: true
    }
})
const Message = mongoose.model("Message", messageSchema)

export async function storeMessage(username, content, messageid, timestamp){
    const message = await Message.insertMany({username: username, content:content, messageId: messageid })
    return message
}

export default Message