import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import DAO from '../model/dao.js';
const mongod = new MongoMemoryServer();



/**
 * Connect to the in-memory database.
 */
export async function connect() {
    await mongod.start();
    const mongoUri = mongod.getUri();
    const dao = DAO.getInstance();
    await dao.setDB(mongoUri);
}

/**
 * Drop database, close the connection and stop mongod.
 */
export async function closeDatabase() {
    const dao = DAO.getInstance();
    dao.closeDB();
    await mongod.stop();
}

/**
 * Remove all the data for all db collections.
 */
export async function clearDatabase() {
    const dao = DAO.getInstance();
    await dao.clearDB();
}