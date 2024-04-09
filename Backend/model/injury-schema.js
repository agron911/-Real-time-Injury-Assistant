import mongoose from "mongoose";

const injurySchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    reported: {
        type: Boolean,
        required: true
    },
    timestamp: {
        type: String,
        required: false
    },
    parts: {
        type: String,
        required: false
    },
    bleeding: {
        type: Boolean,
        required: false
    },
    numbness: {
        type: Boolean,
        required: false
    },
    conscious: {
        type: Boolean,
        required: false
    }
})

const injuryCollection = new mongoose.model("Injury", injurySchema);

export default injuryCollection;