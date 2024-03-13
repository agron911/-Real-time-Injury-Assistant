import { connect, closeDatabase, clearDatabase } from './db-handler';
import User from '../model/user-class';
import { hashPassword, comparePassword } from "../utils/passwordUtils.js";
import DAO from '../model/dao.js';
import { loginRegister } from '../controller/joinCommunity.js';
import { axios } from 'axios';


/**
 * Connect to a new in-memory database before running any tests.
 */
beforeAll(async () => await connect());

/**
 * Clear all test data after every test.
 */
afterEach(async () => await clearDatabase());

/**
 * Remove and close the db and server.
 */
afterAll(async () => await closeDatabase());

let host = "http://localhost:3000";

describe('Testing API', () => {

    test('Get users', () => {
        try{
            const response = axios.get(host + '/users');
            expect(response.status).toBe(200);
        }catch(err){
            // expect(err.message || err).toBe("Failed to get users");
            console.log(err) 
        }
        
    })
})