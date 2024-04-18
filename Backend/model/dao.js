import mongoose from "mongoose";
import userCollection from "./user-schema.js"
import messageCollection from "./message-schema.js";
import requestCollection from "./request-schema.js";
import UserFactory from './userFactory.js'; 
import facilityCollection from "./Facility-schema.js";
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

    createUser = async (username, hashed_password, status, usertype, esp) => {
        try {
            const userSchemaObject = {
                username: username,
                password: hashed_password,
                status: status,
                online: false, 
                acknowledged: false, 
                usertype: usertype,
                esp: esp
            }
            console.log('before',userSchemaObject);
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

    updateUserEsp = async (username, esp) => {
        try {
            const user = await userCollection.findOneAndUpdate(
                { username: username }, 
                { $set: { esp: esp } },);
            return user;
        } catch (err) { 
            throw new Error("Update user esp error: ", err.message);
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

    // Create a new request
    createRequest = async (requestData) => {
        try {
            const newRequest = new requestCollection(requestData);
            const reqObj = await newRequest.save();
            return reqObj;
        } catch (error) {
            throw new Error(`Error creating request`);
        }
    };

    getRequestsByUsername = async (username) => {
        try {        
            const requests = await requestCollection.find({ username: { $eq: username } });
            return requests;
        } catch (error) {
            throw new Error(`Error getting requests: ${error.message}`);
        }
    }
    

    getRequestsByStatus = async (statuses) =>{
        try {        
            const requests = await requestCollection.find({ status: { $in: statuses } });
            return requests;
        } catch (error) {
            throw new Error(`Error getting requests: ${error.message}`);
        }
    }
// Update an existing request by ID
    updateRequest = async (requestId, updatedData) => {
        try {
            const updatedRequest = await requestCollection.findByIdAndUpdate(
                requestId,
                updatedData,
                { new: true } // Return the updated document
            );
            if (!updatedRequest) {
                throw new Error('Request not found');
            }
            return updatedRequest;
        } catch (error) {
            throw new Error(`Error updating request: ${error.message}`);
        }
    };

    // Remove a request by ID
    removeRequest = async (requestId) => {
        try {
            await requestCollection.findByIdAndDelete(requestId);
        } catch (error) {
            throw new Error(`Error removing request: ${error.message}`);
        }
    };

    getRequestById = async (requestId) => {
        try {
            const req = await requestCollection.findById(requestId);
            if(!req) throw new Error('Request not found');
            return req;
        } catch (error) {
            throw new Error(`Request not found`);
        }
    };
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
    createGroupMessage = async (username, content, timestamp, status, receiver, viewed, group) => {
        try {
            const msg = await messageCollection.insertMany({ username: username, content: content, timestamp: timestamp, status: status, receiver: receiver, viewed: viewed, group: group });
            return msg;
        } catch (err) {
            throw new Error("Create message error: ", err);
        }
    }
    addFacility = async(facilityname, facilitylatitude, facilitylongitude, facilitytype, facilityaddress, facilityHours)=>{
        const santaClaraCountyBoundary = {
            north: 37.7186, // Adjusted to positive latitude
            south: 36.9034, // Adjusted to positive latitude
            east: -121.3716, // Adjusted to negative longitude
            west: -122.1291, // Adjusted to negative longitude
        };
        
        function isInSantaClaraCounty(latitude, longitude) {
            console.log(latitude)
            console.log(longitude)
            if (
                latitude >= santaClaraCountyBoundary.south &&
                latitude <= santaClaraCountyBoundary.north &&
                longitude >= santaClaraCountyBoundary.west &&
                longitude <= santaClaraCountyBoundary.east
            ) {
                console.log("true")
                return true;
            } else {
                console.log("false")
                return false;
            }
        }
        try{
            let check = await facilityCollection.find({ name: facilityname}); 
            if(check.length ==0 && isInSantaClaraCounty(facilitylatitude, facilitylongitude)){
                const facility = await facilityCollection.insertMany({ name: facilityname, latitude: facilitylatitude, longitude: facilitylongitude, type: facilitytype, address:facilityaddress, hours:facilityHours });
            return facility;
            }
            else{
                return ;
            }
            
        }catch(err){
            console.log(err)
        }
    }
    getFacilities = async()=>{
        const facilities = await facilityCollection.find({})
        return facilities
    }
    getFacility = async(facilityname)=>{
        const facility = await facilityCollection.findOne({name: facilityname})
        return facility
    }
    searchFacility = async(description, mobility)=>{
        console.log("searching facilities...");
        if(description === "Open-Wound"|| description ==="Difficulty-Breathing"){
            return await facilityCollection.find({type:"Emergency Room"});
        }else if((description ==="Sprain"|| description==="Limb-Pain"||description ==="Head-Injury") && mobility ==="No"){
            return await facilityCollection.find({type:"Urgent Care"});
        }
        else{
            return await facilityCollection.find({type:"Emergency Room"});
        }
    }
    deleteFacility = async(fname)=>{
        try{
            await facilityCollection.updateOne({name:fname},{
                $set:{reportedclosed:true}
            })
            return
        }catch(err){
            throw new Error("Delete Facility Error: ", err)
        }
        
    }

    updateFacilityInfo = async(name, hours)=>{
        try{
            await facilityCollection.updateOne({name:name},{
                $set:{hours:hours}
            })
            return;
        }catch(err){
            throw new Error("Update Facility Info Error: ", err)
        }
        
    }

    // Create a new request
    createRequest = async (requestData) => {
        try {
            const newRequest = new requestCollection(requestData);
            const reqObj = await newRequest.save();
            return reqObj;
        } catch (error) {
            throw new Error(`Error creating request`);
        }
    };

    getRequestsByUsername = async (username) => {
        try {        
            const requests = await requestCollection.find({ username: { $eq: username } });
            return requests;
        } catch (error) {
            throw new Error(`Error getting requests: ${error.message}`);
        }
    }
    

    getRequestsByStatus = async (statuses) =>{
        try {        
            const requests = await requestCollection.find({ status: { $in: statuses } });
            return requests;
        } catch (error) {
            throw new Error(`Error getting requests: ${error.message}`);
        }
    }
// Update an existing request by ID
    updateRequest = async (requestId, updatedData) => {
        try {
            const updatedRequest = await requestCollection.findByIdAndUpdate(
                requestId,
                updatedData,
                { new: true } // Return the updated document
            );
            if (!updatedRequest) {
                throw new Error('Request not found');
            }
            return updatedRequest;
        } catch (error) {
            throw new Error(`Error updating request: ${error.message}`);
        }
    };

    // Remove a request by ID
    removeRequest = async (requestId) => {
        try {
            await requestCollection.findByIdAndDelete(requestId);
        } catch (error) {
            throw new Error(`Error removing request: ${error.message}`);
        }
    };

    getRequestById = async (requestId) => {
        try {
            const req = await requestCollection.findById(requestId);
            if(!req) throw new Error('Request not found');
            return req;
        } catch (error) {
            throw new Error(`Request not found`);
        }
    };
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
    createGroupMessage = async (username, content, timestamp, status, receiver, viewed, group) => {
        try {
            const msg = await messageCollection.insertMany({ username: username, content: content, timestamp: timestamp, status: status, receiver: receiver, viewed: viewed, group: group });
            return msg;
        } catch (err) {
            throw new Error("Create message error: ", err);
        }
    }
}
    


export default DAO;




