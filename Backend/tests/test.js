import { connect, closeDatabase, clearDatabase } from './db-handler';
import { hashPassword, comparePassword } from "../utils/passwordUtils.js";
import DAO from '../model/dao.js';
import { loginRegister } from '../controller/joinCommunity.js';
import Citizen from '../model/user-Citizen.js';

/**
 * Connect to a new in-memory database before running any tests.
 */
beforeAll(async () =>  await connect());

/**
 * Clear all test data after every test.
 */
afterEach(async () => await clearDatabase());

/**
 * Remove and close the db and server.
 */
afterAll( async () =>  await closeDatabase() );


describe('Password Operations', () => {

    test('Rejects passwords shorter than minimum length', () => {
        try{
            Citizen.validate('daniel', '1');
        }catch(err){
            expect(err.message || err).toBe("Password length invalid")
        }
    })
    test('Accepts valid password length',  () => {
        const isvalid = Citizen.validate('daniel', '1234');
        expect(isvalid).toBe(0);
    })
    test('Test existing user password match', async() => {
        const hashedpasssword = await hashPassword('1234')
        const new_user = await DAO.getInstance().createUser('daniel', hashedpasssword, 'ok', 'administrator')
        console.log("!!!!!!!!!!",new_user)
        const passwordresult =  await comparePassword(new_user.password, '1234')
        return Citizen.retrieve('daniel').then((citizen) => {
            expect(passwordresult).toBe(true);
        })
    })
    test('Test existing user password mismatch', async() => {
        const hashedpasssword = await hashPassword('1234')
        const new_user = await DAO.getInstance().createUser('daniel', hashedpasssword, 'ok', 'citizen')
        const passwordresult =  await comparePassword(new_user.password, '12345')
        return Citizen.retrieve('daniel').then((citizen) => {
            expect(passwordresult).toBe(false);
        })
    })
})

describe('Username Operations', () => {
    test('Accepts usernames with valid length', () => {
        const isvalid = Citizen.validate('Taige', '1234');
        expect(isvalid).toBe(0);
    })

    test('Rejects usernames with prohibited words', () => {
        try{
            Citizen.validate('careers', '1234');
        }catch(err){
            expect(err.message || err).toBe ("Username prohibited")
        }
    })
    
    test('Rejects usernames shorter than minimum length', () => {
        try{
            Citizen.validate('d', '1234');
        }catch(err){
            expect(err.message || err).toBe ("Username length invalid")
        }
    })

    test('Username is not case sensitive', async() => {
        await DAO.getInstance().createUser('daniel', await hashPassword('1234'), 'ok','citizen')
        const citizen = await DAO.getInstance().getUserByName('Daniel')
        expect(citizen).not.toBeNull()
    });

    test('Successfully creates and retrieves a user', async() => {
        await DAO.getInstance().createUser('daniel2', await hashPassword('1234'), 'ok','citizen')
        const citizen = await DAO.getInstance().getUserByName('daniel2')
        expect(citizen).not.toBeNull()
    });

})

describe('Update information', () => {
    test("Update user's online ", async () => {
        await DAO.getInstance().createUser('agron', await hashPassword('1234'), 'ok','citizen')
        await DAO.getInstance().updateUserOnline('agron')
        let citizen = await DAO.getInstance().getUserByName('agron')
        let online_sts = citizen.online;
        expect(online_sts).toBe(true)

        await DAO.getInstance().updateUserOffline('agron')
        citizen = await DAO.getInstance().getUserByName('agron')
        online_sts = citizen.online;
        expect(online_sts).toBe(false)
    });

    test("Update user's Acknowledgement", async () => {
        await DAO.getInstance().createUser('agron', await hashPassword('1234'), 'ok','citizen')
        await DAO.getInstance().updateUserAcknowledgement('agron')
        let citizen = await DAO.getInstance().getUserByName('agron')
        let acknowledged = citizen.acknowledged;
        expect(acknowledged).toBe(true)
    })

    test("Update user's status", async () => {
        await DAO.getInstance().createUser('agron', await hashPassword('1234'), 'ok','citizen')
        let citizen = await DAO.getInstance().getUserByName('agron')
        let status = citizen.status;
        expect(status).toBe('ok')
        await DAO.getInstance().updateUserStatus('agron', 'help')
        citizen = await DAO.getInstance().getUserByName('agron')
        status = citizen.status;
        expect(status).toBe('help')
        await DAO.getInstance().updateUserStatus('agron', 'emergency')
        citizen = await DAO.getInstance().getUserByName('agron')
        status = citizen.status;
        expect(status).toBe('emergency')
    })
});

describe("Message Operations", () => {
    test("Create a public message", async () => {
        let citizen = 'agron'
        let date_now = new Date().toString()
        let content = 'test public'
        let status = 'ok'
        let receiver = 'all'
        await DAO.getInstance().createMessage(citizen, content , date_now, status, receiver, false)
        let message = await DAO.getInstance().getAllMessages("all")
        let msg = message.filter(msg => msg.username === citizen && msg.timestamp === date_now)
        expect(msg[0].content).toBe(content)

    })

    test("Create a private message", async () => {
        let citizen = 'agron123'
        let date_now = new Date().toString()
        let content = 'test public'
        let status = 'ok'
        let receiver = 'daniel'
        await DAO.getInstance().createMessage(citizen, content, date_now, status, receiver , false)
        let message = await DAO.getInstance().getAllPrivateMessages(citizen, receiver)
        let msg = message.filter(msg => msg.username === citizen && msg.timestamp === date_now)
        expect(msg[0].content).toBe(content)
    })
});