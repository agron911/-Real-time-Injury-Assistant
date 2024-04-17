import mongoose from "mongoose";
import userCollection from "./user-schema.js"
import messageCollection from "./message-schema.js";
import UserFactory from './userFactory.js';
import { stopWords } from '../utils/user-config.js';

class DAO {

    #configured = false; // private
    _db; // this must implement all IDatabase operations    
    static instance;
    static type;

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
            console.log("Unable to connect to Database\n", error);
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
        // if (this.#configured) {
        //     throw new Error("DB already configured!");
        // }
        await this.connectDB(uri);
        this.#configured = true;
    }

    async closeDB() {
        if (!this.#configured) {
            throw new Error("DB not configured!");
        }
        // await mongoose.connection.dropDatabase();
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

    createUser = async (username, hashed_password, status, usertype, specialists) => {
        try {
            const userObject = UserFactory.createUser(usertype, username, hashed_password, status, specialists);
            const userSchemaObject = userObject.toSchemaObject();
            const user = await userCollection.create(userSchemaObject);
            if (specialists) {
                for (let specialist of specialists) {
                    await this.ConfirmGroup(specialist, username);
                }
            }
            return user;
        } catch (err) {
            console.error("insert failed", err);
            return new Error("Insert failed :", err);
        }
    }

    getUserByName = async (username) => {
        try {
            const user = await userCollection.findOne({ username: username.toLowerCase() });
            return user;
        } catch (err) {
            return new Error("User not found: ", err);
        }
    }

    filterStopWords = async (input) => {

        const words = input.trim().split(" ");
        const filteredWords = words.filter(word => !stopWords.includes(word.toLowerCase()));

        if (filteredWords.length == 0) {
            return "";
        }

        return filteredWords.join(" ");
    }

    search_by_username = async (username,) => {
        try {

            var result = await userCollection.find({ username: new RegExp(username) }).sort({ online: -1, username: 1 });
            return result;
        } catch (err) {
            throw new Error("Search did not find results with specified parameters:", err);
        }
    }

    search_by_status = async (status) => {
        try {
            var result = await userCollection.find({ status: status }).sort({ online: -1, username: 1 });
            return result;

        } catch (err) {
            throw new Error("Search did not find results with specified parameters:", err);
        }
    }

    search_by_public_messages = async (message, limit) => {
        try {
            const msg = await this.filterStopWords(message);
            if (msg.length === 0) {
                return null;
            }
            var result = await messageCollection.find({ content: new RegExp(message), receiver: "all" }).sort({ timestamp: -1, username: 1 }).limit(limit);
            return result;
        } catch (err) {
            throw new Error("Search did not find results with specified parameters:", err);
        }
    }

    search_by_announcement = async (announcement, limit) => {
        try {
            const msg = await this.filterStopWords(announcement);
            if (msg.length === 0) {
                return null;
            }
            var result = await messageCollection.find({ content: new RegExp(announcement), receiver: "announcement" }).sort({ timestamp: -1 }).limit(limit);
            return result;
        } catch (err) {

            throw new Error("Search did not find results with specified parameters:", err);
        }
    }

    search_by_private_messages = async (message, sender, receiver, limit) => {
        try {
            const msg = await this.filterStopWords(message);
            if (msg.length === 0) {
                return null;
            }
            var result = await messageCollection.find({ content: new RegExp(message), receiver: { $in: [sender, receiver] }, username: { $in: [receiver, sender] } }).sort({ timestamp: -1 }).limit(limit)
            return result
        } catch (err) {

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
            await userCollection.findOneAndUpdate({ username: username }, { status: status, statusChangeTimestamp: new Date().toString(), $push: { statusHistory: status } });
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
    createGroupMessage = async (username, content, timestamp, status, receiver, viewed, group) => {
        try {
            const msg = await messageCollection.insertMany({ username: username, content: content, timestamp: timestamp, status: status, receiver: receiver, viewed: viewed, group: group });
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
            return new Error("Get all messages error: ", err);
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
        try {
            msgs = await messageCollection.find({ receiver: username, viewed: false });
            for (const msg of msgs) {
                this.updateMessageById(msg._id, { viewed: true });
            }
        } catch (err) {
            console.log("Get unread messages error: ", err);
        }

        return msgs;
    }

    CheckGroupConfirmation = async (group, username) => {
        try {
            // confirmGroup storse a list of users who have confirmed the group
            const user = await userCollection.findOne({ username: username, confirmGroup: { $in: [group] } });
            return user ? true : false;
        } catch (err) {
            console.error(err);
            return false;
        }
    }

    ConfirmGroup = async (group, username) => {
        try {
            const updateResult = await userCollection.findOneAndUpdate(
                { username: username },
                { $addToSet: { confirmGroup: group } },
                { new: true }
            );
            return updateResult ? true : false;
        } catch (err) {
            return false;
        }
    }

    getAllGroupMessages = async (group) => {
        try {
            const msgs = await messageCollection.find({ receiver: group });
            return msgs;
        } catch (err) {
            console.error("Get all group messages error:", err);
            return [];
        }
    }

    getGroupUsers = async (group) => {
        try {
            const groupUsers = await userCollection.find(
                { confirmGroup: { $in: group } }
            );
            return groupUsers;
        } catch (err) {
            console.error("Get all group messages error:", err);
            return [];
        }
    }
    getSpecialists = async (group) => {
        try {
            const Specialists = await userCollection.find(
                { specialist: { $in: group }, specialist: { $exists: true, $ne: [] } }
                
            ).lean();
            const specialists = Specialists.map(specialist => specialist.username);

            return specialists;
        } catch (err) {
            return [];
        }
    }

    deleteMessageById = async (id) => {
        try {
            await messageCollection.findByIdAndDelete(id);
            return true;
        } catch (err) {
            console.error(err);
            return false;
        }
    }


}

export default DAO;




