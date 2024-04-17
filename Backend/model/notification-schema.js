import mongoose from 'mongoose';

const notificationSchema  = new mongoose.Schema({
    username:{
        type: String,
        required: true
    },
    supplier:{
        type: String,
        required: true
    },
    medname:{
        type: String,
        required: true
    },
    timestamp:{
        type: String,
        required: true
    },
    viewed:{
        type: Boolean,
        required: true,
        default: false
    }
})
const notificationCollection = new mongoose.model("Notification", notificationSchema);

export default notificationCollection;