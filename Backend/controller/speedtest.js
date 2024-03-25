import { io } from "../utils/socketSetup.js";
import { connect,} from '../tests/db-handler.js';

export async function suspendNormalOps(req, res){
    io.emit("suspendNormalOps");
    await connect();

}