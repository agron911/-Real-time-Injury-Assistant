import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    username:{
        type: String,
        required: true
    },
    password:{
        type: String,
        required: true
    },
    acknowledged:{
        type: Boolean,
        required: false,
    },
    online: {
        type: Boolean,
        required: true,
    },
    status: {
        type: String,
        required: true,
    },
    statusHistory: [],
    statusChangeTimestamp: {
        type: String, 
        required: false,
    },
    usertype: {
        type: String,
        required: true,
        enum: ['Citizen', 'Administrator', 'Coordinator'],
    },
    useraccountstatus:{
        type: String,
        required: true,
        enum: ['Active', 'Inactive'],
    },
    esp: {
        type: Boolean,
        required: true,
        default: false,
    },
    waitlistRole: {
        type: String,
        required: true,
        enum: ['undefined', 'citizen', 'provider'],
    },
    specialist: {
        type: [String],
        required: false,
    },
    confirmGroup:{
        type: [String],
        required: false,
        default: [],
    }

})

const userCollection = new mongoose.model('User', UserSchema);

export default userCollection;