import { connect, closeDatabase, clearDatabase } from './db-handler';
import User from '../model/user-class';
import { hashPassword, comparePassword } from "../utils/passwordUtils.js";
import DAO from '../model/dao.js';
import { loginRegister } from '../controller/joinCommunity.js';
import axios from 'axios';


/**
 * Connect to a new in-memory database before running any tests.
 */
beforeAll(async () => {
    await connect()
});

/**
 * Clear all test data after every test.
 */
afterEach(async () => await clearDatabase());

/**
 * Remove and close the db and server.
 */
afterAll(async () => await closeDatabase());

let host = "http://localhost:3000";

jest.mock('axios');

describe('Testing API', () => {

    test('/Get user status', async () => {
        // await DAO.getInstance().createUser('agron', await hashPassword('1234'), 'ok')
        const response = await axios.get(host + '/test');
        console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!", response);
        expect(response.data).toBe('Hello World!');
    })

    // test('/Update user status', async () => {
    //     await DAO.getInstance().createUser('agron', await hashPassword('1234'), 'ok')
    //     const response = await axios.post(host + '/user/status/agron', {status: 'help' });
    //     console.log(response);
        
    // })
})