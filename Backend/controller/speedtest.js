import { io } from "../utils/socketSetup.js";
import DAO from "../model/dao.js"

export const suspendNormalOps = async (req, res)=>{
    /*conect test db*/
    io.emit("suspendNormalOps");
    

}