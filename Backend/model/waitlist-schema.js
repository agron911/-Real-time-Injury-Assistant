import mongoose from 'mongoose';

const WaitlistSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    description:{
        type: String,
        required: true
    },
    citizens: [{
        username: String,
        timestamp: String,
    }],
    count: {
        type: Number,
        default: 0
    },
    default: {
        type: Boolean,
        default: false
    },
    supplier: [{
        username: String,
        count: Number
    }]
})

const waitlistCollection = new mongoose.model('Waitlist', WaitlistSchema);
export default waitlistCollection;