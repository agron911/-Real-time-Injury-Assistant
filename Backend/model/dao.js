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
import { comparePassword, hashPassword } from "../utils/passwordUtils.js";

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
            
            DAO.instance = new DAO();
        }
        return DAO.instance;
    }

    async connectDB(uri) {
        try {
            await mongoose.connect(uri);
            this.#configured = true;
            
        } catch (error) {
            
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

    createUser = async (username, hashed_password, status, usertype, esp, waitlistRole, specialist) => {
        try {
            const userSchemaObject = UserFactory.createUser(usertype, username, hashed_password, status, esp, waitlistRole, specialist).toSchemaObject();
            // console.log('userSchemaObject', userSchemaObject);
            const user = await userCollection.create(userSchemaObject);
            const injury = await injuryCollection.create({ username: username, reported: false });
            if (specialist) {
                for (let spec of specialist) {
                    await this.ConfirmGroup(spec, username);
                }
            }
            return user;
        } catch (err) {
            console.error("insert failed", err);
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
    getUserById = async (userid) => {
        try {
            const user = await userCollection.findOne({ "_id": Object(userid)});
            return user;
        } catch (err) {
            throw new Error("User not found: ", err);
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
    createMessage = async (userid, receiverid, username, content, timestamp, status, receiver, viewed) => {
        try {
            
            const msg = await messageCollection.insertMany({ userid: userid, receiverid:receiverid, username: username, content: content, timestamp: timestamp, status: status, receiver: receiver, viewed: viewed });
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
            console.error(err.message);
            return null;
        }
    };

    getInactiveUsers = async () => {
        const users = await userCollection.find({useraccountstatus: "Inactive"});
        return users.map((user) =>user._id);
    }

    removeInactiveUserMessages = async (messages) =>{
        if(messages.length<=0) return [];
        let inActiveUsers = await this.getInactiveUsers();
        inActiveUsers = inActiveUsers.map((userid) => userid.toString());
        // console.log('inActiveUsers', inActiveUsers, inActiveUsers.includes(messages[0].userid), inActiveUsers.includes(messages[0].receiverid));
        messages = messages.filter(message => !(inActiveUsers.includes(message.userid.toString())||inActiveUsers.includes(message.receiverid.toString())));
        return messages;
    }

    getAllMessages = async (receiver) => {
        try {
            if(receiver != "all" && receiver != "announcement"){
                const user = await this.getUserByName(receiver);
                if(user.useraccountstatus == 'Inactive') {
                    throw new Error("User is inactive");
                }
            }
            const msgs = await messageCollection.find({ receiver: receiver });
            return await this.removeInactiveUserMessages(msgs);
        } catch (err) {
            throw new Error("Get all messages error: ", err);
        }
    }
    getAllPrivateMessages = async (userid, receiverid) => {
        try {
            let msgs = await messageCollection.find({
                $or: [
                    { userid: userid, receiverid: receiverid },
                    { userid: receiverid, receiverid: userid }
                ]
            }).sort({ timestamp: 1 });

            msgs = msgs?await this.removeInactiveUserMessages(msgs):[];

            msgs = await this.removeInactiveUserMessages(msgs);
            // console.log('2',msgs.length);
            return msgs;
        } catch (err) {
            console.log("err", err);
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
            msgs = await this.removeInactiveUserMessages(msgs);
            return msgs;
        }catch(err){
            return null;
        }
    }

    changeUserInfo = async(userid, accountstatus, username, priviledge, password, actionerid)=>{
        try{
            let actioner;
            if(actionerid){
                actioner = await DAO.getInstance().getUserById(actionerid);
            } 
            let user = await DAO.getInstance().getUserById(userid);
            if (!user) {
                return { success: false, message: "User not found" };
            }
            if (username.toLowerCase() !== user.username.toLowerCase()) {
                if(actioner && actioner.id !== user.id && actioner.usertype != 'Administrator' ){
                    return { success: false, message: "Only user or administrator can change username"};
                }
                username = username.toLowerCase();
            }
            console.log("priviledge level", priviledge, user.usertype);
            if ((priviledge != "Administrator" && user.usertype == "Administrator") || (priviledge === 'Administrator' && accountstatus === 'Inactive')) {
                const administrators = await DAO.getInstance().getAdministrators();
                console.log("Administrators numbers", administrators.length);
                if (administrators.length <= 1) {
                    return { success: false, message: "There must be at least one administrator active." };
                }
            }

            if(accountstatus !== user.usertype) {
                if(actioner && actioner.usertype != 'Administrator' ){
                    return { success: false, message:"Only administrator can change usertype"}
                }
            }
            if (password !== "") {
                // console.log("password changed",(await comparePassword(await hashPassword(password), user.password)), user.password, await hashPassword(password));
                if(actioner && actioner.usertype != 'Administrator' && (await comparePassword(await hashPassword(password), user.password)) ){
                    return { success: false, message: "Only administrator can change password"}
                }
                console.log("password changed", password);
                // password = await hashPassword(password);
            } else {
                password = user.password;
            }
            let res = await userCollection.updateOne({_id:Object(userid) }, {$set:{"username":username, "useraccountstatus":accountstatus, "usertype":priviledge, "password":password}});
            return { success: true, res };
        }catch(error){
            console.error("Error updating user info:", error);
            return { success: false, message: error.message };
        }
    }

    CheckGroupConfirmation = async (group, username) => {
        try {
            // confirmGroup storse a list of users who have confirmed the group
            const user = await userCollection.findOne({ username: username, confirmGroup: { $in: [group] } });
            return user ? true : false;
        } catch (err) {
            console.error(err.message);
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
            let msgs = await messageCollection.find({ receiver: group });
            msgs = await this.removeInactiveUserMessages(msgs);
            return msgs;
        } catch (err) {
            console.error("Get all group messages error:", err.message);
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
            console.error("Get all group messages error:", err.message);
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
            console.error(err.message);
            return false;
        }
    }
    createGroupMessage = async (userid, username, content, timestamp, status, receiver, viewed, group) => {
        try {
            const msg = await messageCollection.insertMany({ userid:userid, username: username, content: content, timestamp: timestamp, status: status, receiver: receiver, viewed: viewed, group: group, receiverid:"1" });
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
            
            
            if (
                latitude >= santaClaraCountyBoundary.south &&
                latitude <= santaClaraCountyBoundary.north &&
                longitude >= santaClaraCountyBoundary.west &&
                longitude <= santaClaraCountyBoundary.east
            ) {
                
                return true;
            } else {
                
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
            console.error(err.message);
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
            console.error("Get all group messages error:", err.message);
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
            console.error("Get all group messages error:", err.message);
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
            console.error(err.message);
            return false;
        }
    }
    createGroupMessage = async (userid, username, content, timestamp, status, receiver, viewed, group) => {
        try {
            const msg = await messageCollection.insertMany({userid:userid, username: username, content: content, timestamp: timestamp, status: status, receiver: receiver, viewed: viewed, group: group, receiverid:"1"});
            return msg;
        } catch (err) {
            throw new Error("Create message error: ", err);
        }
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
            // console.log("update injury", username, timestamp, parts, bleeding, numbness, conscious);
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
            // console.error("Insert failed for create notification", err);
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

    changeMessageUsername = async(userid, newusername)=>{
        try{
            let res = await messageCollection.updateMany({"userid":userid}, {$set:{"username": newusername}});
            let res2 = await messageCollection.updateMany({"receiverid":userid}, {$set:{"receiver":newusername}});
            return
        }catch(er){
            
        }
    }

    getAdministrators = async () => {
        try {
            const administrators = await userCollection.find({ usertype: "Administrator" });
            return administrators;
        } catch (err) {
            throw new Error("Get administrators error: ", err);
        }
    }


}
    


export default DAO;




