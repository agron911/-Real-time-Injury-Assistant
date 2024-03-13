import { connect, closeDatabase, clearDatabase } from './db-handler';
import User from '../model/user-class';
import { hashPassword, comparePassword } from "../utils/passwordUtils.js";
import DAO from '../model/dao.js';
import { loginRegister } from '../controller/joinCommunity.js';


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


describe('Password Operations', () => {

    test('password should be long enough', () => {
        try{
            User.validate('daniel', '1');
        }catch(err){
            expect(err.message || err).toBe("Password length invalid")
        }

    })
    test('Password is good',  () => {
        const isvalid = User.validate('daniel', '1234');
        expect(isvalid).toBe(0);
    })
    test('Test existing user password match', async() => {
        const hashedpasssword = await hashPassword('1234')
        const new_user = await DAO.createUser('daniel', hashedpasssword, 'ok')
        const passwordresult =  await comparePassword(new_user[0].password, '1234')
        return User.retrieve('daniel').then((user) => {
            expect(passwordresult).toBe(true);
        })
    })
    test('Test existing user password mismatch', async() => {
        const hashedpasssword = await hashPassword('1234')
        const new_user = await DAO.createUser('daniel', hashedpasssword, 'ok')
        const passwordresult =  await comparePassword(new_user.password, '12345')
        return User.retrieve('daniel').then((user) => {
            expect(passwordresult).toBe(false);
        })
    })
})

describe('Username Operations', () => {
    test('Username should be valid', () => {
        const isvalid = User.validate('Taige', '1234');
        expect(isvalid).toBe(0);
    })

    test('Username should not be prohibited', () => {
        try{
            User.validate('careers', '1234');
        }catch(err){
            expect(err.message || err).toBe ("Username prohibited")
        }
    })
    
    test('Username should be long enough', () => {
        try{
            User.validate('d', '1234');
        }catch(err){
            expect(err.message || err).toBe ("Username length invalid")
        }
    })

    test('Case Sensitivity', async() => {
        const user1  = await DAO.createUser('daniel', await hashPassword('1234'), 'ok')
        const user = await DAO.getUserByName('Daniel')
        console.log(user)
        let check = 0
        if(user){
            check = 1
        }
        expect(check).toBe(1)
    });

    test('Create and retrieve user', async() => {
        const user1  = await DAO.createUser('daniel', await hashPassword('1234'), 'ok')
        const user = await DAO.getUserByName('daniel')
        console.log(user)
        let check = 0
        if(user){
            check = 1
        }
        expect(check).toBe(1)
    });

    test('New Username', async() =>{
        await DAO.createUser('daniel', await hashPassword('1234'), 'ok')
        const new_user_atempt = await loginRegister({username:'daniel54', password:'1234'})
        expect(new_user_atempt).toBe(1)
    })


})