import mongoose from "mongoose";
import userCollection from "./user-schema.js"
import messageCollection from "./message-schema.js";
import UserFactory from './userFactory.js'; 
import { stopWords } from '../utils/user-config.js';
import injuryCollection from "./injury-schema.js";
import waitlistCollection from "./waitlist-schema.js";
import notificationCollection from "./notification-schema.js";

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

    createUser = async (username, hashed_password, status, usertype) => {
        try {
            const userObject = UserFactory.createUser(usertype, username, hashed_password, status);
            const userSchemaObject = userObject.toSchemaObject();
            const user = await userCollection.create(userSchemaObject);
            const injury = await injuryCollection.create({ username: username, reported: false });
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

    filterStopWords = async(input) =>{
    
        const words = input.trim().split(" ");
        const filteredWords = words.filter(word => !stopWords.includes(word.toLowerCase()));
    
        if (filteredWords.length == 0) {
            return "";
        }
    
        return filteredWords.join(" ");
    }
    
    search_by_username = async (username,) => {
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

    search_by_public_messages = async (message, limit) => {
        try{
            const msg = await this.filterStopWords(message);
            if (msg.length === 0) {
                return null;
            }            
            var result = await messageCollection.find({ content: new RegExp(message), receiver: "all"}).sort({ timestamp: 1, username: 1 }).limit(limit);
            return result;
        } catch(err) {
            throw new Error("Search did not find results with specified parameters:", err);
        }
    }

    search_by_announcement = async (announcement, limit) => {
        try{
            const msg = await this.filterStopWords(announcement);
            if (msg.length === 0) {
                return null;
            }
            var result = await messageCollection.find({content: new RegExp(announcement), receiver: "announcement"}).sort({timestamp:1}).limit(limit);
            return result;
        } catch(err) {

            throw new Error("Search did not find results with specified parameters:", err);
        }
    }

    search_by_private_messages = async (message, sender, receiver, limit)=>{
        try{
            const msg = await this.filterStopWords(message);
            if (msg.length === 0) {
                return null;
            }
            var result = await messageCollection.find({content: new RegExp(message), receiver:{ $in: [sender, receiver]}, username: {$in:[receiver, sender]}}).sort({ timestamp: 1}).limit(limit)
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
            await userCollection.findOneAndUpdate({ username: username }, { status: status, statusChangeTimestamp: new Date().toString(), $push:{statusHistory:status} } );
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
        try{
            msgs = await messageCollection.find({ receiver: username, viewed: false });
            for (const msg of msgs) {
                this.updateMessageById(msg._id, { viewed: true });
            }
        }catch(err){
            console.log("Get unread messages error: ", err);
        }
        
        return msgs;
    }



/*----------------Iter 4 Taige-------------------*/ 
/*----------------Seek First Aid-------------------*/
    createInjury = async (username, reported, timestamp, parts, bleeding, numbness, conscious) => {
        try {
            const injury = await injuryCollection.create({ username: username, reported: reported, timestamp: timestamp, parts: parts, bleeding: bleeding, numbness: numbness, conscious: conscious });
            return injury;
        } catch (err) {
            console.error("Insert failed for create injury", err);
            throw new Error("Insert failed :", err);
        }
    }

    getInjuryByUser = async (username) => {
        try {
            const injury = await injuryCollection.findOne({ username: username });
            return injury;
        } catch (err) {
            console.error("Injury not found: ", err);
            throw new Error("Injury not found: ", err);
        }
    }

    updateInjury = async (username, timestamp, parts, bleeding, numbness, conscious) => {
        try {
            await injuryCollection.findOneAndUpdate({ username: username }, { reported: true, timestamp: timestamp, parts: parts, bleeding: bleeding, numbness: numbness, conscious: conscious });
        } catch (err) {
            console.error("Update injury error: ", err);
            throw new Error("Update injury error: ", err);
        }
    }

    updateWaitlistRole = async (username, role) => {
        try {
            await userCollection.findOneAndUpdate({ username: username }, { waitlistRole: role });
        } catch (err) {
            throw new Error("Update waitlist role error: ", err);
        }
    }

    createWaitlist = async (name, description) => {
        try {
            const waitlist = await waitlistCollection.create({ name: name, description: description, citizens: [], supplier: []});
            return waitlist;
        } catch (err) {
            console.error("Insert failed for create waitlist", err);
            return new Error("Insert failed :", err);
        }
    }

    getWaitlist = async () => {
        try {
            const waitlist = await waitlistCollection.find();
            return waitlist;
        } catch (err) {
            console.error("Waitlist not found: ", err);
            return new Error("Waitlist not found: ", err);
        }
    }

    getWaitlistByName = async (name) => {
        try {
            const waitlist = await waitlistCollection.findOne({ name: name });
            return waitlist;
        } catch (err) {
            console.error("Waitlist not found: ", err);
            return new Error("Waitlist not found: ", err);
        }
    }

    addCitizenToWaitlist = async (waitlistName, username, timestamp) => {
        try {
            await waitlistCollection.findOneAndUpdate({ name: waitlistName }, { $push: { citizens: { username: username, timestamp: timestamp } } });
        } catch (err) {
            throw new Error("Add citizen to waitlist error: ", err);
        }
    }

    addSupplierToWaitlist = async (waitlistName, username, count) => {
        try {
            await waitlistCollection.findOneAndUpdate({ name: waitlistName }, { $push: { supplier: { username: username, count: count } } });
        } catch (err) {
            throw new Error("Add supplier to waitlist error: ", err);
        }
    }

    removeSupplierFromWaitlist = async (waitlistName, username) => {
        try {
            await waitlistCollection.findOneAndUpdate({ name: waitlistName }, { $pull: { supplier: { username: username } } });
        } catch (err) {
            throw new Error("Remove supplier from waitlist error: ", err);
        }
    }

    updateCountByName = async (medname, count) => {
        try {
            await waitlistCollection.findOneAndUpdate({ name: medname }, { count: count });
        } catch (err) {
            throw new Error("Update count by name error: ", err);
        }
    }

    removeCitizenFromWaitlist = async (waitlistName, username) => {
        try {
            await waitlistCollection.findOneAndUpdate({ name: waitlistName }, { $pull: { citizens: { username: username } } });
        } catch (err) {
            throw new Error("Remove citizen from waitlist error: ", err);
        }
    }

    emptyCitizensByName = async (medname) => {
        try {
            await waitlistCollection.findOneAndUpdate({ name: medname }, { citizens: [] });
        } catch (err) {
            throw new Error("Empty citizens by name error: ", err);
        }
    }

    createNotification = async (username, supplier, medname, timestamp) => {
        try {
            const notification = await notificationCollection.create({ username: username, supplier: supplier, medname: medname, timestamp: timestamp, viewed: false });
            return notification;
        } catch (err) {
            console.error("Insert failed for create notification", err);
            return new Error("Insert failed :", err);
        }
    }

    getNotificationByUser = async (username) => {
        try {
            const notifications = await notificationCollection.find({ username: username, viewed: false });
            return notifications;
        } catch (err) {
            console.error("Notification not found: ", err);
            return new Error("Notification not found: ", err);
        }
    }

    deleteNotificationById = async (id) => {
        try {
            await notificationCollection.findByIdAndDelete(new mongoose.Types.ObjectId(id));
        } catch (err) {
            console.error(err);
        }
    }

}
export default DAO;




