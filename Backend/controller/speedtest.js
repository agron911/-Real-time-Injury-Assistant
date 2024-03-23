import { io } from "../utils/socketSetup.js";
import { connect,} from './db-handler';

export async function suspendNormalOps(req, res){
    io.emit("suspendNormalOps");
    await connect();

}