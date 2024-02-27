const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const mongod = new MongoMemoryServer();



/**
 * Connect to the in-memory database.
 */
export async function connect() {
    await mongod.start();
    const mongoUri = mongod.getUri();

    await mongoose.connect(mongoUri);
}

/**
 * Drop database, close the connection and stop mongod.
 */
export async function closeDatabase() {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongod.stop();
}

/**
 * Remove all the data for all db collections.
 */
export async function clearDatabase() {
    const collections = mongoose.connection.collections;

    for (const key in collections) {
        const collection = collections[key];
        await collection.deleteMany();
    }
}