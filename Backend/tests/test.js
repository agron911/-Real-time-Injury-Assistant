import { connect, closeDatabase, clearDatabase } from './db-handler';
import { hashPassword, comparePassword } from "../utils/passwordUtils.js";
import DAO from '../model/dao.js';
import { loginRegister } from '../controller/joinCommunity.js';
import Citizen from '../model/user-Citizen.js';
import Request from '../model/request-class.js';
import {searchByPublicMessage, searchByPrivateMessages, searchPublicMessage} from '../controller/search_info.js';
import {jest} from '@jest/globals';
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
        // const hashedpasssword = await hashPassword('1234')
        const new_user = await DAO.getInstance().createUser('daniel', '1234', 'ok', 'administrator')
        console.log("kkpassword", new_user.password);
        const passwordresult =  await comparePassword(new_user.password, '1234')
        expect(passwordresult).toBe(true);
        
    })
    test('Test existing user password mismatch', async() => {
        const hashedpasssword = await hashPassword('1234')
        const new_user = await DAO.getInstance().createUser('daniel', hashedpasssword, 'ok', 'Citizen', false)
        const passwordresult =  await comparePassword(new_user.password, '12345')
        expect(passwordresult).toBe(false);
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
        await DAO.getInstance().createUser('daniel', await hashPassword('1234'), 'ok','Citizen', false)
        const citizen = await DAO.getInstance().getUserByName('Daniel')
        expect(citizen).not.toBeNull()
    });

    test('Successfully creates and retrieves a user', async() => {
        await DAO.getInstance().createUser('daniel2', await hashPassword('1234'), 'ok','Citizen', false)
        const citizen = await DAO.getInstance().getUserByName('daniel2')
        expect(citizen).not.toBeNull()
    });

})

describe('Update information', () => {
    test("Update user's online ", async () => {
        await DAO.getInstance().createUser('agron', await hashPassword('1234'), 'ok','Citizen', false)
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
        await DAO.getInstance().createUser('agron', await hashPassword('1234'), 'ok','Citizen', false)
        await DAO.getInstance().updateUserAcknowledgement('agron')
        let citizen = await DAO.getInstance().getUserByName('agron')
        let acknowledged = citizen.acknowledged;
        expect(acknowledged).toBe(true)
    })

    test("Update user's status", async () => {
        await DAO.getInstance().createUser('agron', await hashPassword('1234'), 'ok','Citizen', false)
        let citizen = await DAO.getInstance().getUserByName('agron');
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

// search information
// unit test for the stop word Unit tests for the Stop Words Rule for Search Information written and pass

describe('Search operation for stop words', () => {

    test('Rejects stop words in PublicMessage', async () => {
        const input = "this";
        
        let citizen = 'agron123'
        let date_now = new Date().toString()
        let content = 'this is an example'
        let status = 'ok'
        let receiver = 'all'
        let limit = 10
        await DAO.getInstance().createMessage(citizen, content, date_now, status, receiver , false)


        const result = await DAO.getInstance().search_by_public_messages(input, limit);
        expect(result).toBe(null);

    });

    test('Rejects stop words in PrivateMessage', async () => {
        const input = "this";
        
        let citizen = 'agron123'
        let date_now = new Date().toString()
        let content = 'this is an example'
        let status = 'ok'
        let receiver = 'daniel'
        let limit = 10
        await DAO.getInstance().createMessage(citizen, content, date_now, status, receiver , false)


        const result = await DAO.getInstance().search_by_private_messages(input, citizen, receiver, limit);
        expect(result).toBe(null);

    })
    
})

describe('Search operation', () => {
    
    test('Accept search words in public', async () => {
        const input = "example";
        let citizen = 'agron123'
        let date_now = new Date().toString()
        let content = 'this is an example'
        let status = 'ok'
        let receiver = 'all'
        let limit = 10
        await DAO.getInstance().createMessage(citizen, content, date_now, status, receiver , false)
  
        const result = await DAO.getInstance().search_by_public_messages(input, limit);
        expect(result).not.toBeNull()
    })
    test('Accept search words in public', async () => {
        const input = "@#";
        let citizen = 'agron123'
        let date_now = new Date().toString()
        let content = 'this is an example'
        let status = 'ok'
        let receiver = 'all'
        let limit = 10
        await DAO.getInstance().createMessage(citizen, content, date_now, status, receiver , false)
  
        const result = await DAO.getInstance().search_by_public_messages(input, limit);
        console.log(result)
        expect(result).not.toBeNull()
    })
    test('Rejects stop words in PublicMessage', async () => {
        const input = "is";
        
        let citizen = 'agron123'
        let date_now = new Date().toString()
        let content = 'this is an example'
        let status = 'ok'
        let receiver = 'all'
        let limit = 10
        await DAO.getInstance().createMessage(citizen, content, date_now, status, receiver , false)


        const result = await DAO.getInstance().search_by_public_messages(input, limit);
        expect(result).toBe(null);

    });
    test('Rejects stop words in announcement', async () => {
        const input = "an";
        let citizen = 'agron123'
        let date_now = new Date().toString()
        let content = 'this is an example'
        let status = 'ok'
        let receiver = 'announcement'
        let limit = 10
        await DAO.getInstance().createMessage(citizen, content, date_now, status, receiver , false)
        const result = await DAO.getInstance().search_by_announcement(input, citizen, receiver, limit);
        expect(result).toBeNull()

    });
    test('Rejects stop multiple words in announcement', async () => {
        const input = "is an";
        let citizen = 'agron123'
        let date_now = new Date().toString()
        let content = 'this is an example'
        let status = 'ok'
        let receiver = 'announcement'
        let limit = 10
        await DAO.getInstance().createMessage(citizen, content, date_now, status, receiver , false)
        const result = await DAO.getInstance().search_by_announcement(input, citizen, receiver, limit);
        expect(result).toBeNull()

    });

    test('Accept search words in private', async () => {
        const input = "example";
        let citizen = 'agron123'
        let date_now = new Date().toString()
        let content = 'this is an example'
        let status = 'ok'
        let receiver = 'daniel'
        let limit = 10
        await DAO.getInstance().createMessage(citizen, content, date_now, status, receiver , false)

        const result = await DAO.getInstance().search_by_private_messages(input, citizen, receiver, limit);
        expect(result).not.toBeNull()
    })
    test('Reject search mulitple words in private', async () => {
        const input = "is an";
        let citizen = 'agron123'
        let date_now = new Date().toString()
        let content = 'this is an example'
        let status = 'ok'
        let receiver = 'daniel'
        let limit = 10
        await DAO.getInstance().createMessage(citizen, content, date_now, status, receiver , false)

        const result = await DAO.getInstance().search_by_private_messages(input, citizen, receiver, limit);
        expect(result).toBeNull()
    })
    test('Reject search mulitple words in private', async () => {
        const input = "is an";
        let citizen = 'agron123'
        let date_now = new Date().toString()
        let content = 'this is an example'
        let status = 'ok'
        let receiver = 'daniel'
        let limit = 10
        await DAO.getInstance().createMessage(citizen, content, date_now, status, receiver , false)

        const result = await DAO.getInstance().search_by_private_messages(input, citizen, receiver, limit);
        expect(result).toBeNull()
    })

    test('Accept search words in announcement', async () => {
        const input = "example";
        let citizen = 'agron123'
        let date_now = new Date().toString()
        let content = 'this is an example'
        let status = 'ok'
        let receiver = 'announcement'
        let limit = 10
        await DAO.getInstance().createMessage(citizen, content, date_now, status, receiver , false)
        const result = await DAO.getInstance().search_by_announcement(input, limit);
        console.log(result)
        expect(result).not.toBeNull()
    })
    test('Accept search in status', async () => {
        let citizen = 'agron123'
        let status = 'ok'
        await DAO.getInstance().createUser(citizen, await hashPassword('1234'), status,'Citizen')
        const result = await DAO.getInstance().search_by_status(status);
        expect(result).not.toBeNull()
    })
    test('Accept search in username', async () => {
        let citizen = 'agron123'
        let status = 'ok'
        await DAO.getInstance().createUser(citizen, await hashPassword('1234'), status,'Citizen')
        const result = await DAO.getInstance().search_by_username(citizen);
        expect(result).not.toBeNull()
    })
    test('Accept search in username', async () => {
        let citizen = 'agron123'
        let status = 'ok'
        await DAO.getInstance().createUser(citizen, await hashPassword('1234'), status,'Citizen')
        const result = await DAO.getInstance().search_by_username(citizen);
        expect(result).not.toBeNull()
    })
  

})

describe('Esp registration', () => {
    
    test('A citizen successfully registers as esp', async () => {
        //create citizen  
        const username = 'testuser';
        await DAO.getInstance().createUser(username, 'wqed', 'ok', 'Citizen', false);
        let citizen = await Citizen.retrieveUserByUsername(username);
        citizen = await citizen.setAsEsp();
        citizen = await Citizen.retrieveUserByUsername(username);
        expect(citizen.esp).toEqual(true);
    });

    test('A citizen fails to register if user does not exist', async () => {
        //create citizen  
        const username = 'testuser2';
        // await DAO.getInstance().createUser(username, 'wqed', 'ok', 'Citizen', false);
        try{
            let citizen = await Citizen.retrieveUserByUsername(username);
            citizen = await citizen.setAsEsp();
            citizen = await Citizen.retrieveUserByUsername(username);
        } catch(e){
            expect(e.message).toEqual('User not found');
        }
        
    });
})

describe('Request handling', () => {

    test('A citizen can create a request', async () => {
        const username = 'testuser';
        await DAO.getInstance().createUser(username, 'wqed', 'ok', 'Citizen', false);
        let citizen = await Citizen.retrieveUserByUsername(username);
        citizen = await citizen.setAsEsp();
        citizen = await Citizen.retrieveUserByUsername(username);
        const request = new Request(username, 'content', 'Dog', null, "UNRESOLVED");
        await request.save(); 
        expect(request.id).not.toBeNull(); 
    })

    test('A citizen can retreive a request by id', async () => {
        const username = 'testuser';
        await DAO.getInstance().createUser(username, 'wqed', 'ok', 'Citizen', false);
        let citizen = await Citizen.retrieveUserByUsername(username);
        citizen = await citizen.setAsEsp();
        citizen = await Citizen.retrieveUserByUsername(username);
        const request = new Request(username, 'content', 'Dog', null, "UNRESOLVED");
        await request.save(); 
        const req = await DAO.getInstance().getRequestById(request.id);
        expect(request.id).toEqual(req.id); 
    })

    test('A citizen can update a request status', async () => {
        const username = 'testuser';
        await DAO.getInstance().createUser(username, 'wqed', 'ok', 'Citizen', false);
        let citizen = await Citizen.retrieveUserByUsername(username);
        citizen = await citizen.setAsEsp();
        citizen = await Citizen.retrieveUserByUsername(username);
        let request = new Request(username, 'content', 'Dog', null, "UNRESOLVED");
        await request.save(); 
        const newRequest = {
            status: "RESOLVED",
        }
        const updatedRequest = await DAO.getInstance().updateRequest(request.id, newRequest);
        expect(updatedRequest.status).toEqual('RESOLVED'); 
    })

    test('A citizen can remove a request', async () => {
        const username = 'testuser';
        await DAO.getInstance().createUser(username, 'wqed', 'ok', 'Citizen', false);
        let citizen = await Citizen.retrieveUserByUsername(username);
        citizen = await citizen.setAsEsp();
        citizen = await Citizen.retrieveUserByUsername(username);
        let request = new Request(username, 'content', 'Dog', null, "UNRESOLVED");
        await request.save(); 
        expect(request.id).not.toBeNull(); 
        await DAO.getInstance().removeRequest(request.id);
        try{
            await DAO.getInstance().getRequestById(request.id);
        } catch(e){
            expect(e.message).toEqual('Request not found');
        }
    })

    test('A citizen can get requests by his username', async () => {
        const username = 'testuserusername';
        await DAO.getInstance().createUser(username, 'wqed', 'ok', 'Citizen', false);
        let citizen = await Citizen.retrieveUserByUsername(username);
        citizen = await citizen.setAsEsp();
        citizen = await Citizen.retrieveUserByUsername(username);
        let request = new Request(username, 'content', 'Dog', null, "UNRESOLVED");
        await request.save(); 
        let request2 = new Request(username, 'content1', 'Dog', null, "UNRESOLVED");
        await request2.save(); 
        const requests = await DAO.getInstance().getRequestsByUsername(username);
        expect(requests.length).toEqual(2); 
    })

    test('A request status cannot be anything except the predefined ones', async () => {
        const username = 'testuser';
        await DAO.getInstance().createUser(username, 'wqed', 'ok', 'Citizen', false);
        let citizen = await Citizen.retrieveUserByUsername(username);
        citizen = await citizen.setAsEsp();
        citizen = await Citizen.retrieveUserByUsername(username);
        let request = new Request(username, 'content', 'Dog', null, "WEIRD");
        try{
            await request.save();  
        } catch (e){
            expect(e.message).toEqual('Error creating request');
        }
    })

    test('A request severity cannot be anything except the predefined ones', async () => {
        const username = 'testuser';
        await DAO.getInstance().createUser(username, 'wqed', 'ok', 'Citizen', false);
        let citizen = await Citizen.retrieveUserByUsername(username);
        citizen = await citizen.setAsEsp();
        citizen = await Citizen.retrieveUserByUsername(username);
        let request = new Request(username, 'content', 'Bug', null, "UNRESOLVED");
        try{
            await request.save();  
        } catch (e){
            expect(e.message).toEqual('Error creating request');
        }
    })

    test('When a citizen updates a request, a new request is not created instead', async () => {
        const username = 'testuserunique';
        await DAO.getInstance().createUser(username, 'wqed', 'ok', 'Citizen', false);
        let citizen = await Citizen.retrieveUserByUsername(username);
        citizen = await citizen.setAsEsp();
        citizen = await Citizen.retrieveUserByUsername(username);
        let request = new Request(username, 'content', 'Dog', null, "UNRESOLVED");
        await request.save(); 
        const newRequest = {
            status: "RESOLVED",
        }
        const updatedRequest = await DAO.getInstance().updateRequest(request.id, newRequest);
        const requests = await DAO.getInstance().getRequestsByUsername(username);
        expect(requests.length).toEqual(1); 
    })

})