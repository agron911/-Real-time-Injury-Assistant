import Server from './server.js';
import DAO from './Backend/model/dao.js';
import { configDotenv } from 'dotenv';


configDotenv();

//attach Database
// const main_uri = process.env.PROD_MONGO_DB_URI;
const main_uri = process.env.LOCAL_MONGO_DB_URI;
const dao = DAO.getInstance();
DAO.type = "PROD";
await dao.setDB(main_uri);

Server.createAndRun();


