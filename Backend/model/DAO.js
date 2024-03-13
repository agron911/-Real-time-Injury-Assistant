import mongoose from "mongoose";
import userCollection from "./user-schema.js"
import messageCollection from "./message-schema.js";

class DAO {

    #configured = false; // private
    _db; // this must implement all IDatabase operations    
    static instance;

    constructor(){
        if(DAO.instance != null){
            throw new TypeError("Attempted to create a second instance");
        }
        this.me = 1;
    }

    static getInstance(){
        if(DAO.instance == null){
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

    createUser = async(username, hashed_password, status) => {
        const user = await userCollection.insertMany({ username: username, password: hashed_password, acknowledged: false, online: false, status: status});
        return user;
    }

    getUserByName = async(username) => {
        const user = await userCollection.findOne({ username: username.toLowerCase() });
        return user;
    }


    getAllUsers = async() => {
        const users = await userCollection.find().sort({online: -1, username: 1});
        return users;
    }

    updateUserAcknowledgement = async (username) => {
        await userCollection.findOneAndUpdate({ username: username }, { acknowledged: true });
    }
    
    updateUserOnline = async(username) => {
        await userCollection.findOneAndUpdate({ username: username }, { online: true });
    }
    
    updateUserOffline = async(username) => {
        const user = await userCollection.findOneAndUpdate({ username: username }, { online: false });
    }

    updateUserStatus = async(username, status) => {
        await userCollection.findOneAndUpdate({ username : username }, { status: status });
        console.log(username, status);
    }
    
    createMessage = async(username, content, timestamp, status, receiver, viewed) => {
        const msg = await messageCollection.insertMany({username: username, content: content, timestamp: timestamp, status: status, receiver: receiver, viewed: viewed});
        return msg;
    }

    updateMessageById = async (id, updateData) => {
        try {
        const  updatedDocument = await messageCollection.findByIdAndUpdate(
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


    

    getAllMessages = async(receiver) => {
        const msgs = await messageCollection.find({receiver: receiver});
        return msgs;
    }
    getAllPrivateMessages = async(username, receiver) => {
        const msgs = await messageCollection.find({
            $or: [
              { username: username, receiver: receiver },
              { username: receiver, receiver: username }
            ]
          }).sort({timestamp: 1});
        return msgs;
    }

    getUnreadMessages = async(username) => {
        const msgs = await messageCollection.find({receiver: username, viewed: false});
        // const msgs = await messageCollection.aggregate([
        //     { $match: { receiver: username, viewed: false } },
        //     { $sort: { timestamp: -1 }},
        //     {
        //         $group: {
        //           _id: "$username",
        //           latestMessage: {
        //             $first: "$content"
        //           }
        //         }
        //       },
        //     // { $sort: { _id: -1 }},
        //     // { $limit: 1}
        // ]);
        for (const msg of msgs) {
            this.updateMessageById(msg._id, {viewed: true});
        }
        return msgs;
    }




}

export default DAO;




