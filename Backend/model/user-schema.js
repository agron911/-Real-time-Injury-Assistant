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
    }

})

const userCollection = new mongoose.model('User', UserSchema);

export async function createUser(username, hashed_password, status) {
    const user = await userCollection.insertMany({ username: username, password: hashed_password, acknowledged: false, online: false, status: status});
    return user;
}

export default userCollection;