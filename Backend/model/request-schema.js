import mongoose from 'mongoose';

const requestSchema  = new mongoose.Schema({
    username:{
        type: String,
        required: true
    },
    content:{
        type: String,
        required: true
    },
    severity:{
        type: String,
        required: true,
        enum: ["Dog", "Tiger", "Monster", "God"],
    },
    assignedTo:  {
        type: String,
        required: false
    },
    status: {
        type: String,
        required: true,
        enum: ["RESOLVED", "UNRESOLVED", "ONGOING"]
    }
})
const requestCollection = new mongoose.model("Request", requestSchema);

export default requestCollection;