const mongoose = require('mongoose');

const dburi = "mongodb+srv://daniilturpitka:Letoosen228@cluster0.1fayqt0.mongodb.net/?retryWrites=true&w=majority"

async function connectdb(){
    try{
        await mongoose.connect(dburi)
        console.log("db connected")
    }
    catch(error){
        console.log("some erro has occured")
    }
}
connectdb()
const UserSchema = new mongoose.Schema({
    userName:{
        type: String,
        required: true
    },
    password:{
        type: String,
        required: true
    }
})

const collection = new mongoose.model("users", UserSchema)
module.exports = collection;