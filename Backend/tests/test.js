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



describe("Counsel Group Operations", () => {
    test('Check Citizen did not accept group confirmation returns false', async () => {
        let citizen = 'agron123'
        let status = 'ok'
        const group = 'Anxiety';
        await DAO.getInstance().createUser(citizen, await hashPassword('1234'), status,'citizen')

        let result = await DAO.getInstance().CheckGroupConfirmation(group, citizen );
        expect(result).toBe(false)
    });
    test('Check Citizen accepted group confirmation returns true', async () => {
        let citizen = 'agron123'
        let status = 'ok'
        let group = 'Anxiety';
        await DAO.getInstance().createUser(citizen, await hashPassword('1234'), status,'citizen')
        await DAO.getInstance().ConfirmGroup(group, citizen)
        let result = await DAO.getInstance().CheckGroupConfirmation(group, citizen );
        expect(result).toBe(true)
    })
    test('Success create group message', async () => {
        let citizen = 'agron123'
        let content = "test cnt"
        let status = 'ok'
        let group = 'Anxiety';
        await DAO.getInstance().createUser(citizen, await hashPassword('1234'), status,'citizen')
        const msg = await DAO.getInstance().createGroupMessage(citizen, content, new Date().toString(), 'ok', group, false, group)
        // Assuming there are messages sent to 'existingGroup'
        expect(msg[0].content).toBe(content);
    });
    test('Success Retrieve group messages', async () => {
        let citizen = 'agron123'
        let content = "test cnt"
        let status = 'ok'
        let group = 'Anxiety';
        await DAO.getInstance().createUser(citizen, await hashPassword('1234'), status,'citizen')
        await DAO.getInstance().createGroupMessage(citizen, content, new Date().toString(), 'ok', group, false, group)
        const messages = await DAO.getInstance().getAllGroupMessages(group)
        expect(messages.length).toBe(1)
    });
    test('Get all users in a group', async () => {
        let citizen = 'agron123'
        let status = 'ok'
        let group = 'Anxiety';

        await DAO.getInstance().createUser(citizen, await hashPassword('1234'), status,'citizen')
        await DAO.getInstance().ConfirmGroup(group, citizen)
        const groupUsers = await DAO.getInstance().getGroupUsers(group);
        expect(groupUsers[0].username).toBe(citizen);
    });
    test('Create a specialist in a group', async () => {
        let citizen = 'agron123'
        let status = 'ok'
        let group = 'Anxiety';
        const user = await DAO.getInstance().createUser(citizen, await hashPassword('1234'), status,'citizen',group)
        expect(user.username).toBe(citizen);
    })
    test('Create a specialist in multiple group', async () => {
        let citizen = 'agron123'
        let status = 'ok'
        let group = ['Anxiety','Stress','Depression'];
        const user = await DAO.getInstance().createUser(citizen, await hashPassword('1234'), status,'citizen',group)
        expect(user.username).toBe(citizen);
        console.log(user.specialist)
        expect(user.specialist).toEqual(group);
    })
    test('Retrieve all specialists in a group', async () => {
        let citizen = 'specialist1'
        let status = 'ok'
        let group = 'Anxiety';
        await DAO.getInstance().createUser(citizen, await hashPassword('1234'), status,'citizen',group)
        let citizen2 = 'specialist2'
        let status2 = 'ok'
        await DAO.getInstance().createUser(citizen2, await hashPassword('1234'), status2,'citizen',group)

        const specialists = await DAO.getInstance().getSpecialists(group);
        expect(specialists[0]).toBe(citizen);
        expect(specialists[1]).toBe(citizen2);
    });
    test('Delete a message by ID', async () => {
        let citizen = 'agron123'
        let content = "test cnt"
        let group = 'Anxiety';
        await DAO.getInstance().createGroupMessage(citizen, content, new Date().toString(), 'ok', group, false, group)
        let messages = await DAO.getInstance().getAllGroupMessages(group)
        expect(messages[0].content).toBe(content);
        const messageId = messages[0]._id;
        await DAO.getInstance().deleteMessageById(messageId);
        messages = await DAO.getInstance().getAllGroupMessages(group)
        expect(messages.length).toBe(0);
    });
    test('Update a message by ID', async () => { 
        let citizen = 'agron123'
        let content = "test cnt"
        let group = 'Anxiety';
        await DAO.getInstance().createGroupMessage(citizen, content, new Date().toString(), 'ok', group, false, group)
        let messages = await DAO.getInstance().getAllGroupMessages(group)
        expect(messages[0].content).toBe(content);
        const messageId = messages[0]._id;
        await DAO.getInstance().updateMessageById(messageId, {content: "new content"});
        messages = await DAO.getInstance().getAllGroupMessages(group)
        expect(messages[0].content).toBe("new content");
    });

    

})