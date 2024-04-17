import { connect, closeDatabase, clearDatabase } from './db-handler';
import { hashPassword, comparePassword } from "../utils/passwordUtils.js";
import DAO from '../model/dao.js';
import Citizen from '../model/user-Citizen.js';
import e from 'express';
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
        await DAO.getInstance().createUser(citizen, await hashPassword('1234'), status,'citizen')
        const result = await DAO.getInstance().search_by_status(status);
        expect(result).not.toBeNull()
    })
    test('Accept search in username', async () => {
        let citizen = 'agron123'
        let status = 'ok'
        await DAO.getInstance().createUser(citizen, await hashPassword('1234'), status,'citizen')
        const result = await DAO.getInstance().search_by_username(citizen);
        expect(result).not.toBeNull()
    })
    test('Accept search in username', async () => {
        let citizen = 'agron123'
        let status = 'ok'
        await DAO.getInstance().createUser(citizen, await hashPassword('1234'), status,'citizen')
        const result = await DAO.getInstance().search_by_username(citizen);
        expect(result).not.toBeNull()
    })
  

})

describe('Report First Aid Operations', () => {
    test('Create and Get injury positive', async () => {
        let username = 'dummy';
        let reported = true;
        let timestamp = new Date().toString();
        let parts = 'torso';
        let bleeding = true;
        let numbness = false;
        let conscious = true;
        await DAO.getInstance().createInjury(username, reported, timestamp, parts, bleeding, numbness, conscious)
        let injuries = await DAO.getInstance().getInjuryByUser(username)
        expect(injuries.username).toBe(username)
        expect(injuries.reported).toBe(reported)
        expect(injuries.timestamp).toBe(timestamp)
        expect(injuries.parts).toBe(parts)
        expect(injuries.bleeding).toBe(bleeding)
        expect(injuries.numbness).toBe(numbness)
        expect(injuries.conscious).toBe(conscious)
    })

    test('Create and Get injury negative', async () => {
        let username = 'dummy';
        let injuries = await DAO.getInstance().getInjuryByUser(username)
        expect(injuries).toBeNull()
    })

    test('Update injury positive', async () => {
        let username = 'dummy';
        let reported = true;
        let timestamp = new Date().toString();
        let parts = 'torso';
        let bleeding = true;
        let numbness = false;
        let conscious = true;
        await DAO.getInstance().createInjury(username, reported, timestamp, parts, bleeding, numbness, conscious)
        await DAO.getInstance().updateInjury(username, new Date().toString(), 'legs', bleeding, numbness, conscious)
        let injuries = await DAO.getInstance().getInjuryByUser(username)
        expect(injuries.username).toBe(username)
        expect(injuries.reported).toBe(reported)
        expect(injuries.parts).toBe('legs')
    })

    test('Update injury negative', async () => {
        let username = 'dummy';
        let reported = true;
        let timestamp = new Date().toString();
        let parts = 'torso';
        let bleeding = true;
        let numbness = false;
        let conscious = true;
        await DAO.getInstance().createInjury(username, reported, timestamp, parts, bleeding, numbness, conscious)
        await DAO.getInstance().updateInjury(username, new Date().toString(), 'legs', bleeding, numbness, conscious)
        let injuries = await DAO.getInstance().getInjuryByUser(username)
        expect(injuries.username).toBe(username)
        expect(injuries.reported).toBe(reported)
        expect(injuries.parts).not.toBe(parts)
    })

    test('Create waitlist positive', async () => {
        let medname = 'dummy';
        let description = 'dummy description';
        await DAO.getInstance().createWaitlist(medname, description)
        let waitlist = await DAO.getInstance().getWaitlistByName(medname)
        expect(waitlist.name).toBe(medname)
        expect(waitlist.description).toBe(description)
    })

    test('Create waitlist negative', async () => {
        let medname = 'dummy';
        let waitlist = await DAO.getInstance().getWaitlistByName(medname)
        expect(waitlist).toBeNull()
    })

    test('Create multiple waitlist positive', async () => {
        let medname = 'dummy';
        let medname2 = 'dummy2';
        let description = 'dummy description';
        await DAO.getInstance().createWaitlist(medname, description)
        await DAO.getInstance().createWaitlist(medname2, description)
        let waitlists = await DAO.getInstance().getWaitlist()
        expect(waitlists.length).toBe(2)
        expect(waitlists[0].name).toBe(medname)
        expect(waitlists[1].name).toBe(medname2)
    })

    test('Join waitlist positive', async () => {
        let medname = 'dummy';
        let description = 'dummy description';
        await DAO.getInstance().createWaitlist(medname, description)
        let username = 'dummy user';
        let timestamp = new Date().toString();
        await DAO.getInstance().addCitizenToWaitlist(medname, username, timestamp)
        let waitlist = await DAO.getInstance().getWaitlistByName(medname)
        expect(waitlist.citizens.length).toBe(1)
        expect(waitlist.citizens[0].username).toBe(username)
    })

    test('Remove waitlist negative', async () => {
        let medname = 'dummy';
        let description = 'dummy description';
        await DAO.getInstance().createWaitlist(medname, description)
        let username = 'dummy user';
        let timestamp = new Date().toString();
        await DAO.getInstance().removeCitizenFromWaitlist(medname, 'test')
        await DAO.getInstance().addCitizenToWaitlist(medname, username, timestamp)
        let waitlist = await DAO.getInstance().getWaitlistByName(medname)
        expect(waitlist.citizens[0].username).not.toBe('test')
    })

    test('Empty waitlist positive', async () => {
        let medname = 'dummy';
        let description = 'dummy description';
        await DAO.getInstance().createWaitlist(medname, description)
        await DAO.getInstance().emptyCitizensByName(medname)
        let waitlist = await DAO.getInstance().getWaitlistByName(medname)
        expect(waitlist.citizens.length).toBe(0)
    })
})