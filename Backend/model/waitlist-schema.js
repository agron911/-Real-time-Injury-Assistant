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
        timestamp: Date,
    }],
    count: {
        type: Number,
        default: 0
    }
})

const waitlistCollection = new mongoose.model('Waitlist', WaitlistSchema);
export default waitlistCollection;