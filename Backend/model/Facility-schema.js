import mongoose from 'mongoose';
const facilitySchema = new mongoose.Schema({
    longitude:{
        type: Number,
        required: true
    },
    latitude:{
        type: Number,
        required: true
    },
    name:{
        type: String,
        required: true
    },
    type:{
        type: String,
        required: true
    },
    address:{
        type: String,
        required: true
    },
    reportedclosed:{
        type: Boolean,
        default: false
    },
    hours:{
        type: String,
        required: true
    }

})
const facilityCollection = new mongoose.model("Facility", facilitySchema);
export default facilityCollection;