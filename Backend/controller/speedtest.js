import { io } from "../utils/socketSetup.js";
import Server from "../../server.js";
import { connect, closeDatabase, clearDatabase } from '../tests/db-handler.js';
import DAO from "../model/dao.js";
// let mongod;

export async function startSpeedTest(req, res){
    const socketID = req.body.socketID;
    Server.disableRoutes(socketID);
    await DAO.getInstance().closeDB();
    // mongod = new MongoMemoryServer();
    await connect();
    DAO.type = "TEST";
    await DAO.getInstance().createUser('henry', 'wqed', 'ok');
    res.status(200).send("success");
    io.emit("suspendNormalOps", socketID);
}

export async function stopSpeedTest(req, res){
    await stopTest();
    res.status(200).send("success");
}

export const stopTest = async()=>{
    const dao = DAO.getInstance();
    if(DAO.type == "TEST"){
        await clearDatabase();
        await closeDatabase();
        const main_uri = process.env.PROD_MONGO_DB_URI;
        await dao.setDB(main_uri);
        DAO.type = "PROD";
    }
    Server.enableRoutes();
    io.emit("enableNormalOperations");
}

export const isSpeedTestOngoing = async(req, res)=>{
    if(Server.instance.testSocketID){
        res.status(200).send(true);
    } else {
        res.status(201).send(false);
    }
};