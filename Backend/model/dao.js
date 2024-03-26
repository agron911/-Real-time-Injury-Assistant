import mongoose from "mongoose";
import userCollection from "./user-schema.js"
import messageCollection from "./message-schema.js";

class DAO {

    #configured = false; // private
    _db; // this must implement all IDatabase operations    
    static instance;

    constructor() {
        if (DAO.instance != null) {
            throw new TypeError("Attempted to create a second instance");
        }
        this.me = 1;
    }

    static getInstance() {
        if (DAO.instance == null) {
            console.log("Creating new instance");
            DAO.instance = new DAO();
        }
        return DAO.instance;
    }

    async connectDB(uri) {
        try {
            await mongoose.connect(uri);
            this.#configured = true;
            console.log("Database connected\n");
        } catch (error) {
            console.log("Unable to connect to Database\n");
            throw new Error("Unable to connect to Database\n");
        }
    }

    async getDB() {
        if (!this.#configured) {
            throw new Error("DB not configured!");
        }
        return this._db;
    }

    async setDB(uri) {
        if (this.#configured) {
            throw new Error("DB already configured!");
        }
        await this.connectDB(uri);
        this.#configured = true;
    }

    async closeDB() {
        if (!this.#configured) {
            throw new Error("DB not configured!");
        }
        await mongoose.connection.dropDatabase();
        await mongoose.connection.close();
    }

    async clearDB() {
        if (!this.#configured) {
            throw new Error("DB not configured!");
        }
        const collections = mongoose.connection.collections;

        for (const key in collections) {
            const collection = collections[key];
            await collection.deleteMany();
        }
    }

    createUser = async (username, hashed_password, status) => {
        try {
            const user = await userCollection.insertMany({ username: username, password: hashed_password, acknowledged: false, online: false, status: status });
            return user;
        } catch (err) {
            throw new Error("Insert failed :", err);
        }
    }

    getUserByName = async (username) => {
        try {
            const user = await userCollection.findOne({ username: username.toLowerCase() });
            return user;
        } catch (err) {
            throw new Error("User not found: ", err);
        }
    }

    search_by_username = async (username) => {
    try{
        var result = await userCollection.find({ username: new RegExp(username)}).sort({ online: -1, username: 1 });
        return result;
    }catch(err){
        throw new Error("Search did not find results with specified parameters:", err);
        }
    }

    search_by_status = async (status)=>{
        try{
            var result = await userCollection.find({ status: status}).sort({ online: -1, username: 1 });
            return result;
        }catch(err){
            throw new Error("Search did not find results with specified parameters:", err);
        }
    }

    search_by_public_messages = async (message) => {
        try{
            var result = await messageCollection.find({ content: new RegExp(message), receiver: "all"}).sort({ timestamp: -1, username: 1 }).limit(10);
            return result;
        } catch(err) {
            throw new Error("Search did not find results with specified parameters:", err);
        }
    }

    search_by_announcement = async (announcement) => {
        try{
            var result = await messageCollection.find({content: new RegExp(announcement), receiver: "announcement"}).sort({timestamp:-1}).limit(10);
            return result;
        } catch(err) {
            throw new Error("Search did not find results with specified parameters:", err);
        }
    }

    search_by_private_messages = async (message, sender, receiver)=>{
        try{
            var result = await messageCollection.find({content: new RegExp(message), receiver:{ $eq: receiver}, username: sender}).sort({ timestamp: -1}).limit(10)
            return result
        } catch(err) {
            throw new Error("Search did not find results with specified parameters:", err);
        }
    }

    getAllUsers = async () => {
        try {
            const users = await userCollection.find().sort({ online: -1, username: 1 });
            return users;
        } catch (err) {
            throw new Error("Get all users error: ", err);
        }
    }

    updateUserAcknowledgement = async (username) => {
        try {
            await userCollection.findOneAndUpdate({ username: username }, { acknowledged: true });
        } catch (err) {
            throw new Error("Update user acknowledgement error: ", err);
        }
    }

    updateUserOnline = async (username) => {
        try {
            await userCollection.findOneAndUpdate({ username: username }, { online: true });
        } catch (err) {
            throw new Error("Update user online error: ", err);
        }
    }
    //comment
    updateUserOffline = async (username) => {
        try {
            const user = await userCollection.findOneAndUpdate({ username: username }, { online: false });
        } catch (err) {
            throw new Error("Update user offline error: ", err);
        }
    }
    updateUserStatus = async (username, status) => {
        try {
            await userCollection.findOneAndUpdate({ username: username }, { status: status, statusChangeTimestamp: new Date().toString() }, );
            console.log(username, status);
        } catch (err) {
            throw new Error("Update user status error: ", err);
        }
    }

    createMessage = async (username, content, timestamp, status, receiver, viewed) => {
        try {
            const msg = await messageCollection.insertMany({ username: username, content: content, timestamp: timestamp, status: status, receiver: receiver, viewed: viewed });
            return msg;
        } catch (err) {
            throw new Error("Create message error: ", err);
        }

    }

    updateMessageById = async (id, updateData) => {
        try {
            const updatedDocument = await messageCollection.findByIdAndUpdate(
                id,
                { $set: updateData },
                { new: true }
            );
            return updatedDocument;
            //   return updatedDocument;
        } catch (err) {
            console.error(err);
            return null;
        }
    };




    getAllMessages = async (receiver) => {
        try {
            const msgs = await messageCollection.find({ receiver: receiver });
            return msgs;
        } catch (err) {
            throw new Error("Get all messages error: ", err);
        }
    }
    getAllPrivateMessages = async (username, receiver) => {
        try {
            const msgs = await messageCollection.find({
                $or: [
                    { username: username, receiver: receiver },
                    { username: receiver, receiver: username }
                ]
            }).sort({ timestamp: 1 });
            return msgs;
        } catch (err) {
            throw new Error("Get all private messages error: ", err);
        }

    }

    getUnreadMessages = async (username) => {
        let msgs;
        try{
            msgs = await messageCollection.find({ receiver: username, viewed: false });
        }catch(err){
            throw new Error("Get unread messages error: ", err);
        }
        for (const msg of msgs) {
            this.updateMessageById(msg._id, { viewed: true });
        }
        return msgs;
    }

}

export default DAO;




