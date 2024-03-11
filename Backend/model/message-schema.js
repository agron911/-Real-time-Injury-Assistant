import mongoose from 'mongoose';

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
    },
    receiver:{
        type: String,
        required: true,
    }
})
const messageCollection = new mongoose.model("Message", messageSchema);

export default messageCollection;