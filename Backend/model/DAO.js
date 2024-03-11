import mongoose from "mongoose";
import userCollection from "./user-schema.js"
import messageCollection from "./message-schema.js";

class DAO {

    static main_uri = "mongodb+srv://daniilturpitka:Letoosen228@cluster0.1fayqt0.mongodb.net/?retryWrites=true&w=majority";
    static #configured = false; // private
    static _db; // this must implement all IDatabase operations
    

    static async connectDB(uri) {
        try {
            await mongoose.connect(uri);
            DAO.#configured = true;
            console.log("Database connected\n");
        } catch (error) {
            console.log("Unable to connect to Database\n");
            throw new Error("Unable to connect to Database\n");
        }
    }

    static async getDB() {
        if (!DAO.#configured) {
            throw new Error("DB not configured!");
        }
        return DAO._db;
    }

    static async setDB(uri) {
        if (DAO.#configured) {
            throw new Error("DB already configured!");
        }
        await DAO.connectDB(uri);
        DAO.#configured = true;
    }

    static async closeDB() {
        if (!DAO.#configured) {
            throw new Error("DB not configured!");
        }
        await mongoose.connection.dropDatabase();
        await mongoose.connection.close();
    }

    static async clearDB() {
        if (!DAO.#configured) {
            throw new Error("DB not configured!");
        }
        const collections = mongoose.connection.collections;

        for (const key in collections) {
            const collection = collections[key];
            await collection.deleteMany();
        }
    }

    static createUser = async(username, hashed_password, status) => {
        const user = await userCollection.insertMany({ username: username, password: hashed_password, acknowledged: false, online: false, status: status});
        return user;
    }

    static getUserByName = async(username) => {
        const user = await userCollection.findOne({ username: username.toLowerCase() });
        return user;
    }


    static getAllUsers = async() => {
        const users = await userCollection.find().sort({online: -1, username: 1});
        return users;
    }

    static updateUserAcknowledgement = async (username) => {
        await userCollection.findOneAndUpdate({ username: username }, { acknowledged: true });
    }
    
    static updateUserOnline = async(username) => {
        await userCollection.findOneAndUpdate({ username: username }, { online: true });
    }
    
    static updateUserOffline = async(username) => {
        const user = await userCollection.findOneAndUpdate({ username: username }, { online: false });
    }

    static updateUserStatus = async(username, status) => {
        await userCollection.findOneAndUpdate({ username : username }, { status: status });
        console.log(username, status);
    }
    
    static createMessage = async(username, content, timestamp, status, receiver) => {
        const msg = await messageCollection.insertMany({username: username, content: content, timestamp: timestamp, status: status, receiver: receiver});
        return msg;
    }

    static getAllMessages = async(receiver) => {
        const msgs = await messageCollection.find({receiver: receiver});
        return msgs;
    }
    static getAllPrivateMessages = async(username, receiver) => {
        const msgs = await messageCollection.find({
            $or: [
              { username: username, receiver: receiver },
              { username: receiver, receiver: username }
            ]
          }).sort({timestamp: 1});
        // console.log(msgs);
        return msgs;
    }



}

export default DAO;




