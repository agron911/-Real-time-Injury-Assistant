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
    statusChangeTimestamp: {
        type: String, 
        required: false,
    },
    usertype: {
        type: String,
        required: true,
        enum: ['Citizen', 'Administrator', 'Coordinator'],
    },

})

const userCollection = new mongoose.model('User', UserSchema);

export default userCollection;