import { v4 as uuidv4 } from 'uuid'

class MessageObj {
    constructor(userid, receiverid, username, content, timestamp, status, receiver){
        this.obj = {
            userid: userid,
            receiverid:receiverid,
            username: username,
            content: content,
            timestamp: timestamp,
            status: status,
            messageId: String,
            receiver: receiver
        };

    }

    // async storeMessage(){
    //     try{
    //         const m = await Message.insertMany({username: this.obj.username, content:this.obj.content, timestamp: this.obj.timestamp, messageId: this.obj.messageid, status: this.obj.status })
    //     }catch(error){
    //         
    //     }
    // }
    // static async loadArchive(){
    //     const messages = await Message.find()
    //     return messages
    // };
}

export default MessageObj;
