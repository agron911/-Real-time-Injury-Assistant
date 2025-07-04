import mongoose from 'mongoose';

const messageSchema  = new mongoose.Schema({
    userid:{
        type: String,
        required: true
    },
    receiverid:{
        type: String,
        required: false
    },
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
    },
    receiver:{
        type: String,
        required: true,
    },
    viewed:{
        type: Boolean,
        required: true
    }
})
const messageCollection = new mongoose.model("Message", messageSchema);

export default messageCollection;