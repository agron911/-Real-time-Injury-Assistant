import { io } from "../utils/socketSetup.js";
import { connect, clearDatabase} from '../tests/db-handler.js';

export async function suspendNormalOps(req, res){
    io.emit("suspendNormalOps");
    await connect();

}

export async function handlePostRequestLimit(req, resp){
    await clearDatabase();
}