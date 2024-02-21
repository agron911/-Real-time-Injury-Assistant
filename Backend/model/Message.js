import mongoose from 'mongoose'
import { v4 as uuidv4 } from 'uuid'

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
        type: String,
        required: true
    },
    status:{
        type: String,
        required: true
    },
    messageId:{
        type:String,
        required: false
    }
})
const Message = mongoose.model("Message", messageSchema)

export async function storeMessage(username, content, timestamp){

    const message = {
        username: username,
        content: content,
        timestamp: timestamp,
        status: "placeholder",
        messageId: uuidv4()
    }
    try{
        const m = await Message.insertMany({username: message.username, content:message.content, timestamp: message.timestamp, messageId: message.messageid, status: message.status })
    }catch(error){
        console.log(error)
    }
    return message
}

export  async function loadMessages(){
    const messages = await Message.find()
    return messages
}

export default Message