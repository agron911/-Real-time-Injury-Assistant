import { connect, closeDatabase, clearDatabase } from './db-handler';
import { hashPassword, comparePassword } from "../utils/passwordUtils.js";
import DAO from '../model/dao.js';
import Citizen from '../model/user-Citizen.js';
import User from '../model/user-class.js';
import Request from '../model/request-class.js';
import { loginRegister } from '../controller/joinCommunity.js';
import { changeUserInfo, getUserProfile, UserActionValidation } from '../controller/adminProfileController.js';
import { loadUnreadMessages, loadPrivateMessages } from '../controller/chatPrivately.js';
import { loadGroupMessages, receiveGroupMessage, CheckConfirmation, ConfirmGroup } from '../controller/counselGroup.js';
import { isUserActive } from '../model/ActiveUser.js';


/**
 * Connect to a new in-memory database before running any tests.
 */
beforeAll(async () => await connect());

beforeEach(async () => await DAO.getInstance().createUser("esnadmin".toLowerCase(), await hashPassword('admin'), "ok", 'administrator', false, 'undefined', []));

/**
 * Clear all test data after every test.
 */
afterEach(async () => {
    await clearDatabase();
    jest.restoreAllMocks();

});

/**
 * Remove and close the db and server.
 */
afterAll(async () => await closeDatabase());

jest.mock('../utils/socketSetup', () => ({
    io: {
        to: () => ({
            emit: jest.fn(),
        }),
    },
}));

describe('Password Operations', () => {

    test('Rejects passwords shorter than minimum length', async () => {
        try {
            await User.validate('daniel', '1');
        } catch (err) {
            expect(err.message || err).toBe("Password length invalid")
        }
    })

    test('Accepts valid password length', async () => {
        const isvalid = await User.validate('daniel', '1234');
        expect(isvalid).toBe(0);
    })

    test('Test existing user password match', async () => {
        const hashedpassword = await hashPassword('1234')
        const new_user = await DAO.getInstance().createUser('daniel2', hashedpassword, 'ok', 'Citizen', false, 'undefined', []);
        const passwordresult = await comparePassword(new_user.password, '1234')
        expect(passwordresult).toBe(true);

    })
    test('Test existing user password mismatch', async () => {
        const hashedpasssword = await hashPassword('1234')
        const new_user = await DAO.getInstance().createUser('daniel', hashedpasssword, 'ok', 'Citizen', false)
        const passwordresult = await comparePassword(new_user.password, '12345')
        expect(passwordresult).toBe(false);
    })
})

describe('Username Operations', () => {
    test('Accepts usernames with valid length', async () => {
        const isvalid = await Citizen.validate('Taige', '1234');
        expect(isvalid).toBe(0);
    })

    test('Rejects usernames with prohibited words', async () => {
        try {
            await Citizen.validate('careers', '1234');
        } catch (err) {
            expect(err.message || err).toBe("Username prohibited")
        }
    })

    test('Rejects usernames shorter than minimum length', async () => {
        try {
            await Citizen.validate('d', '1234');
        } catch (err) {
            expect(err.message || err).toBe("Username length invalid")
        }
    })

    test('Username is not case sensitive', async () => {
        await DAO.getInstance().createUser('daniel', await hashPassword('1234'), 'ok', 'Citizen', false)
        const citizen = await DAO.getInstance().getUserByName('Daniel')
        expect(citizen).not.toBeNull()
        expect(citizen.username).toBe('daniel')
    });

    test('Successfully creates and retrieves a user', async () => {
        await DAO.getInstance().createUser('daniel2', await hashPassword('1234'), 'ok', 'Citizen', false)
        const citizen = await DAO.getInstance().getUserByName('daniel2')
        expect(citizen).not.toBeNull()
        expect(citizen.username).toBe('daniel2')
    });

})

describe('Update information', () => {
    test("Update user's online after creating", async () => {
        await DAO.getInstance().createUser('agron', await hashPassword('1234'), 'ok', 'Citizen', false, 'undefined', [])
        await DAO.getInstance().updateUserOnline('agron')
        let citizen = await DAO.getInstance().getUserByName('agron')
        let online_sts = citizen.online;
        expect(online_sts).toBe(true)
    });

    test("Update user's offline after creating", async () => {
        await DAO.getInstance().createUser('agron', await hashPassword('1234'), 'ok', 'Citizen', false, 'undefined', [])
        await DAO.getInstance().updateUserOffline('agron')
        let citizen = await DAO.getInstance().getUserByName('agron')
        let online_sts = citizen.online;
        expect(online_sts).toBe(false)
    });

    test("Update user's Acknowledgement", async () => {
        await DAO.getInstance().createUser('agron', await hashPassword('1234'), 'ok', 'Citizen', false, 'undefined', [])
        await DAO.getInstance().updateUserAcknowledgement('agron')
        let citizen = await DAO.getInstance().getUserByName('agron')
        let acknowledged = citizen.acknowledged;
        expect(acknowledged).toBe(true)
    })

    test("Create user with status ok", async () => {
        await DAO.getInstance().createUser('agron', await hashPassword('1234'), 'ok', 'Citizen', false, 'undefined', [])
        let citizen = await DAO.getInstance().getUserByName('agron');
        let status = citizen.status;
        expect(status).toBe('ok')
    })

    test("Update user's status to help", async () => {
        await DAO.getInstance().createUser('agron', await hashPassword('1234'), 'ok', 'Citizen', false, 'undefined', [])
        await DAO.getInstance().updateUserStatus('agron', 'help')
        let citizen = await DAO.getInstance().getUserByName('agron')
        let status = citizen.status;
        expect(status).toBe('help')
    })

    test("Update user's status to emergency", async () => {
        await DAO.getInstance().createUser('agron', await hashPassword('1234'), 'ok', 'Citizen', false, 'undefined', [])
        await DAO.getInstance().updateUserStatus('agron', 'emergency')
        let citizen = await DAO.getInstance().getUserByName('agron')
        let status = citizen.status;
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
        let userid = '0'
        let receiverid = '0'
        await DAO.getInstance().createMessage(userid, receiverid, citizen, content, date_now, status, receiver, false)
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
        let userid = '1'
        let receiverid = '2'
        await DAO.getInstance().createMessage(userid, receiverid, citizen, content, date_now, status, receiver, false)
        let message = await DAO.getInstance().getAllPrivateMessages(userid, receiverid)
        let msg = message.filter(msg => msg.username === citizen && msg.timestamp === date_now)
        expect(msg[0].content).toBe(content)
    })

    test('load unread messages', async () => {
        const mockMessages = [
            { id: '1', content: 'Hello World', username: 'agron', viewed: false }
        ];
        jest.spyOn(DAO.getInstance(), 'getUnreadMessages').mockResolvedValue(mockMessages);
        const req = {
            query: {
                username: 'agron'
            }
        };
        const res = {
            send: jest.fn(),
            status: jest.fn().mockReturnThis()
        };
        await loadUnreadMessages(req, res);
        const res_msg = res.send.mock.calls[0][0].archive;
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res_msg).toEqual(mockMessages);
    });
    test("Can't load unread messages", async () => {
        jest.spyOn(DAO.getInstance(), 'getUnreadMessages').mockImplementation(() => {
            throw new Error();
        });
        const req = {
            query: {
                username: 'agron'
            }
        };
        const res = {
            send: jest.fn(),
            status: jest.fn().mockReturnThis()
        };
        await loadUnreadMessages(req, res);
        const res_msg = res.send.mock.calls[0][0].message;
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res_msg).toEqual("Error in loading unread messages");
    });

    test('Update unread Message to read', async () => {
        let citizen = 'agron123'
        let date_now = new Date().toString()
        let content = 'test public'
        let status = 'ok'
        let receiver = 'daniel'
        let userid = '1'
        let receiverid = '2'
        await DAO.getInstance().createMessage(userid, receiverid, citizen, content, date_now, status, receiver, false)
        let message = await DAO.getInstance().getAllPrivateMessages(userid, receiverid)
        let msg = message.filter(msg => msg.username === citizen && msg.timestamp === date_now)
        await DAO.getInstance().updateMessageById(msg[0]._id, { viewed: true })
        let updated_message = await DAO.getInstance().getAllPrivateMessages(userid, receiverid)
        let updated_msg = updated_message.filter(msg => msg.username === citizen && msg.timestamp === date_now)
        expect(updated_msg[0].viewed).toBe(true)
    });

    test("Can't load private messages", async () => {
        jest.spyOn(DAO.getInstance(), 'getAllPrivateMessages').mockImplementation(() => {
            throw new Error();
        });
        const req = {
            query: {
                username1: 'agron',
                username2: 'taige'
            }
        };
        const res = {
            send: jest.fn(),
            status: jest.fn().mockReturnThis()
        };
        await loadPrivateMessages(req, res);
        const res_msg = res.send.mock.calls[0][0].message;
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res_msg).toEqual("Error in loading all private messages");
    });


});

// // search information
// // unit test for the stop word Unit tests for the Stop Words Rule for Search Information written and pass

describe('Search operation for stop words', () => {

    test('Filter stop words in PublicMessage', async () => {
        const input = "this";

        let citizen = 'agron123'
        let date_now = new Date().toString()
        let content = 'this is an example'
        let status = 'ok'
        let receiver = 'all'
        let limit = 10
        let userid = '1'
        let receiverid = '2'
        await DAO.getInstance().createMessage(userid, receiverid, citizen, content, date_now, status, receiver, false)
        const result = await DAO.getInstance().search_by_public_messages(input, limit);
        expect(result).toBe(null);

    });

    test('Filter stop words in PrivateMessage', async () => {
        const input = "this";

        let citizen = 'agron123'
        let date_now = new Date().toString()
        let content = 'this is an example'
        let status = 'ok'
        let receiver = 'daniel'
        let limit = 10
        let userid = '1'
        let receiverid = '2'
        await DAO.getInstance().createMessage(userid, receiverid, citizen, content, date_now, status, receiver, false)


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
        let userid = '1'
        let receiverid = '2'
        await DAO.getInstance().createMessage(userid, receiverid, citizen, content, date_now, status, receiver, false)
        const result = await DAO.getInstance().search_by_public_messages(input, limit);
        expect(result).not.toBeNull()
        expect(result[0].username).toBe(citizen)
        expect(result[0].content).toBe(content)
    })

    test('Accept search words in public', async () => {
        const input = "@#";
        let citizen = 'agron123'
        let date_now = new Date().toString()
        let content = 'this is an example'
        let status = 'ok'
        let receiver = 'all'
        let limit = 10
        let userid = '1'
        let receiverid = '2'
        await DAO.getInstance().createMessage(userid, receiverid, citizen, content, date_now, status, receiver, false)
        const result = await DAO.getInstance().search_by_public_messages(input, limit);
        expect(result).not.toBeNull()
        expect(result.length).toBe(0);
    })

    test('Rejects stop words in PublicMessage', async () => {
        const input = "is";

        let citizen = 'agron123'
        let date_now = new Date().toString()
        let content = 'this is an example'
        let status = 'ok'
        let receiver = 'all'
        let limit = 10
        let userid = '1'
        let receiverid = '2'
        await DAO.getInstance().createMessage(userid, receiverid, citizen, content, date_now, status, receiver, false)
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
        let userid = '1'
        let receiverid = '2'
        await DAO.getInstance().createMessage(userid, receiverid, citizen, content, date_now, status, receiver, false)
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
        let userid = '1'
        let receiverid = '2'
        await DAO.getInstance().createMessage(userid, receiverid, citizen, content, date_now, status, receiver, false)
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
        let userid = '1'
        let receiverid = '2'
        await DAO.getInstance().createMessage(userid, receiverid, citizen, content, date_now, status, receiver, false)

        const result = await DAO.getInstance().search_by_private_messages(input, citizen, receiver, limit);
        expect(result).not.toBeNull()
        expect(result[0].username).toBe(citizen)
        expect(result[0].content).toBe(content)
    })
    test('Reject search mulitple words in private', async () => {
        const input = "is an";
        let citizen = 'agron123'
        let date_now = new Date().toString()
        let content = 'this is an example'
        let status = 'ok'
        let receiver = 'daniel'
        let limit = 10
        let userid = '1'
        let receiverid = '2'
        await DAO.getInstance().createMessage(userid, receiverid, citizen, content, date_now, status, receiver, false)

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
        let userid = '1'
        let receiverid = '2'
        await DAO.getInstance().createMessage(userid, receiverid, citizen, content, date_now, status, receiver, false)

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
        let userid = '1'
        let receiverid = '2'
        await DAO.getInstance().createMessage(userid, receiverid, citizen, content, date_now, status, receiver, false)
        const result = await DAO.getInstance().search_by_announcement(input, limit);
        expect(result).not.toBeNull()
        expect(result[0].username).toBe(citizen)
        expect(result[0].content).toBe(content)
    })
    test('Accept search in status', async () => {
        let citizen = 'agron123'
        let status = 'ok'
        await DAO.getInstance().createUser(citizen, await hashPassword('1234'), status, 'Citizen', false, 'undefined', [])
        const result = await DAO.getInstance().search_by_status(status);
        expect(result).not.toBeNull()
        expect(result[0].username).toBe(citizen)
        expect(result[0].status).toBe(status)
    })
    test('Accept search in username', async () => {
        let citizen = 'agron123'
        let status = 'ok'
        await DAO.getInstance().createUser(citizen, await hashPassword('1234'), status, 'Citizen', false, 'undefined', [])
        const result = await DAO.getInstance().search_by_username(citizen);
        expect(result).not.toBeNull()
        expect(result[0].username).toBe(citizen)
        expect(result[0].status).toBe(status)
    })
    test('Accept search in username', async () => {
        let citizen = 'agron123'
        let status = 'ok'
        await DAO.getInstance().createUser(citizen, await hashPassword('1234'), status, 'Citizen', false, 'undefined', [])
        const result = await DAO.getInstance().search_by_username(citizen);
        expect(result).not.toBeNull()
        expect(result[0].username).toBe(citizen)
        expect(result[0].status).toBe(status)
    })


})

describe('Esp registration', () => {

    test('A citizen successfully registers as esp', async () => {
        //create citizen  
        const username = 'testuser';
        await DAO.getInstance().createUser(username, 'wqed', 'ok', 'Citizen', false);
        let citizen = await Citizen.retrieveUserByUsername(username);
        citizen = await citizen.modifyEsp(true);
        citizen = await Citizen.retrieveUserByUsername(username);
        expect(citizen.esp).toEqual(true);
    });

    test('A citizen fails to register if user does not exist', async () => {
        //create citizen  
        const username = 'testuser2';
        // await DAO.getInstance().createUser(username, 'wqed', 'ok', 'Citizen', false);
        try {
            let citizen = await Citizen.retrieveUserByUsername(username);
            citizen = await citizen.modifyEsp(true);
            citizen = await Citizen.retrieveUserByUsername(username);
        } catch (e) {
            expect(e.message).toEqual('User not found');
        }

    });
})

describe('Request handling', () => {

    test('A citizen can create a request', async () => {
        const username = 'testuser';
        await DAO.getInstance().createUser(username, 'wqed', 'ok', 'Citizen', false);
        let citizen = await Citizen.retrieveUserByUsername(username);
        citizen = await citizen.modifyEsp(true);
        citizen = await Citizen.retrieveUserByUsername(username);
        const request = new Request(username, 'content', 'Dog', null, "UNRESOLVED");
        await request.save();
        expect(request.id).not.toBeNull();
        expect(request.username).toBe(username);
        expect(request.content).toBe('content');
        expect(request.status).toBe('UNRESOLVED');
    })

    test('A citizen can retreive a request by id', async () => {
        const username = 'testuser';
        await DAO.getInstance().createUser(username, 'wqed', 'ok', 'Citizen', false);
        let citizen = await Citizen.retrieveUserByUsername(username);
        citizen = await citizen.modifyEsp(true);
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
        citizen = await citizen.modifyEsp(true);
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
        citizen = await citizen.modifyEsp(true);
        citizen = await Citizen.retrieveUserByUsername(username);
        let request = new Request(username, 'content', 'Dog', null, "UNRESOLVED");
        await request.save();
        expect(request.id).not.toBeNull();
        await DAO.getInstance().removeRequest(request.id);
        try {
            await DAO.getInstance().getRequestById(request.id);
        } catch (e) {
            expect(e.message).toEqual('Request not found');
        }
    })

    test('A citizen can get requests by his username', async () => {
        const username = 'testuserusername';
        await DAO.getInstance().createUser(username, 'wqed', 'ok', 'Citizen', false);
        let citizen = await Citizen.retrieveUserByUsername(username);
        citizen = await citizen.modifyEsp(true);
        citizen = await Citizen.retrieveUserByUsername(username);
        let request = new Request(username, 'content', 'Dog', null, "UNRESOLVED");
        await request.save();
        let request2 = new Request(username, 'content1', 'Dog', null, "UNRESOLVED");
        await request2.save();
        const requests = await DAO.getInstance().getRequestsByUsername(username);
        expect(requests.length).toEqual(2);
        expect(requests[0].id).toEqual(request.id);
        expect(requests[1].id).toEqual(request2.id);

    })

    test('A request status cannot be anything except the predefined ones', async () => {
        const username = 'testuser';
        await DAO.getInstance().createUser(username, 'wqed', 'ok', 'Citizen', false);
        let citizen = await Citizen.retrieveUserByUsername(username);
        citizen = await citizen.modifyEsp(true);
        citizen = await Citizen.retrieveUserByUsername(username);
        let request = new Request(username, 'content', 'Dog', null, "WEIRD");
        try {
            await request.save();
        } catch (e) {
            expect(e.message).toEqual('Error creating request');
        }
    })

    test('A request severity cannot be anything except the predefined ones', async () => {
        const username = 'testuser';
        await DAO.getInstance().createUser(username, 'wqed', 'ok', 'Citizen', false);
        let citizen = await Citizen.retrieveUserByUsername(username);
        citizen = await citizen.modifyEsp(true);
        citizen = await Citizen.retrieveUserByUsername(username);
        let request = new Request(username, 'content', 'Bug', null, "UNRESOLVED");
        try {
            await request.save();
        } catch (e) {
            expect(e.message).toEqual('Error creating request');
        }
    })

    test('When a citizen updates a request, a new request is not created instead', async () => {
        const username = 'testuserunique';
        await DAO.getInstance().createUser(username, 'wqed', 'ok', 'Citizen', false);
        let citizen = await Citizen.retrieveUserByUsername(username);
        citizen = await citizen.modifyEsp(true);
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

describe('Report First Aid Operations', () => {
    test('Create and Get injury with newly created user', async () => {
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

    test('Create and Get injury for undefined users', async () => {
        let username = 'dummy';
        let injuries = await DAO.getInstance().getInjuryByUser(username)
        expect(injuries).toBeNull()
    })

    test('Update injury if users wish to update injury', async () => {
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

    test('Update injury the previous injury should be removed', async () => {
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

    test('Create waitlist with matching medname and description', async () => {
        let medname = 'dummy';
        let description = 'dummy description';
        await DAO.getInstance().createWaitlist(medname, description)
        let waitlist = await DAO.getInstance().getWaitlistByName(medname)
        expect(waitlist.name).toBe(medname)
        expect(waitlist.description).toBe(description)
    })

    test('Create waitlist without descriptions', async () => {
        let medname = 'dummy';
        let waitlist = await DAO.getInstance().getWaitlistByName(medname)
        expect(waitlist).toBeNull()
    })

    test('Create multiple waitlist', async () => {
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

    test('Join waitlist with a newly creater user', async () => {
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

    test('Remove waitlist and verifying user does not exit', async () => {
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

    test('Empty waitlist by dropping the waitlist', async () => {
        let medname = 'dummy';
        let description = 'dummy description';
        await DAO.getInstance().createWaitlist(medname, description)
        await DAO.getInstance().emptyCitizensByName(medname)
        let waitlist = await DAO.getInstance().getWaitlistByName(medname)
        expect(waitlist.citizens.length).toBe(0)
    })
})


describe("Counsel Group Operations", () => {
    test('Check Citizen did not accept group confirmation returns false', async () => {
        let citizen = 'agron123'
        let status = 'ok'
        const group = 'Anxiety';
        await DAO.getInstance().createUser(citizen, await hashPassword('1234'), status, 'citizen', false, 'undefined', [])

        let result = await DAO.getInstance().CheckGroupConfirmation(group, citizen);
        expect(result).toBe(false)
    });
    test('Check Citizen accepted group confirmation returns true', async () => {
        let citizen = 'agron123'
        let status = 'ok'
        let group = 'Anxiety';
        await DAO.getInstance().createUser(citizen, await hashPassword('1234'), status, 'citizen', false, 'undefined', [])
        await DAO.getInstance().ConfirmGroup(group, citizen)
        let result = await DAO.getInstance().CheckGroupConfirmation(group, citizen);
        expect(result).toBe(true)
    })
    test('Success create group message', async () => {
        let citizen = 'agron123'
        let content = "test cnt"
        let status = 'ok'
        let group = 'Anxiety';
        let userid = '1'
        await DAO.getInstance().createUser(citizen, await hashPassword('1234'), status, 'citizen', false, 'undefined', [])
        const msg = await DAO.getInstance().createGroupMessage(userid, citizen, content, new Date().toString(), 'ok', group, false, group)
        // Assuming there are messages sent to 'existingGroup'
        expect(msg[0].content).toBe(content);
    });
    test('Success Retrieve group messages', async () => {
        let citizen = 'agron123'
        let content = "test cnt"
        let status = 'ok'
        let group = 'Anxiety';
        let userid = '1'
        await DAO.getInstance().createUser(citizen, await hashPassword('1234'), status, 'citizen', false, 'undefined', [])
        await DAO.getInstance().createGroupMessage(userid, citizen, content, new Date().toString(), 'ok', group, false, group)
        const messages = await DAO.getInstance().getAllGroupMessages(group)
        expect(messages.length).toBe(1)
    });
    test('Get all users in a group', async () => {
        let citizen = 'agron123'
        let status = 'ok'
        let group = 'Anxiety';

        await DAO.getInstance().createUser(citizen, await hashPassword('1234'), status, 'citizen', false, 'undefined', [])
        await DAO.getInstance().ConfirmGroup(group, citizen)
        const groupUsers = await DAO.getInstance().getGroupUsers(group);
        expect(groupUsers[0].username).toBe(citizen);
    });
    test('Create a specialist in a group', async () => {
        let citizen = 'agron123'
        let status = 'ok'
        let group = 'Anxiety';
        const user = await DAO.getInstance().createUser(citizen, await hashPassword('1234'), status, 'citizen', false, 'undefined', group)
        expect(user.username).toBe(citizen);
    })
    test('Create a specialist in multiple group', async () => {
        let citizen = 'agron123'
        let status = 'ok'
        let group = ['Anxiety', 'Stress', 'Depression'];
        await DAO.getInstance().createUser(citizen, await hashPassword('1234'), status, 'citizen', false, 'undefined', group)
        const user = await DAO.getInstance().getUserByName(citizen);
        expect(user.username).toBe(citizen);
        expect(user.confirmGroup).toEqual(group);
    })

    test('Retrieve all specialists in a group', async () => {
        let citizen = 'specialist1'
        let status = 'ok'
        let group = 'Anxiety';
        await DAO.getInstance().createUser(citizen, await hashPassword('1234'), status, 'citizen', false, 'undefine', group)
        let citizen2 = 'specialist2'
        let status2 = 'ok'
        await DAO.getInstance().createUser(citizen2, await hashPassword('1234'), status2, 'citizen', false, 'undefined', group)
        const specialists = await DAO.getInstance().getSpecialists(group);
        expect(specialists[0]).toBe(citizen);
        expect(specialists[1]).toBe(citizen2);
    });

    test('Delete a message by ID', async () => {
        let citizen = 'agron123'
        let content = "test cnt"
        let group = 'Anxiety';
        let userid = '1'
        await DAO.getInstance().createGroupMessage(userid, citizen, content, new Date().toString(), 'ok', group, false, group)
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
        let userid = '1'
        await DAO.getInstance().createGroupMessage(userid, citizen, content, new Date().toString(), 'ok', group, false, group)
        let messages = await DAO.getInstance().getAllGroupMessages(group)
        expect(messages[0].content).toBe(content);
        const messageId = messages[0]._id;
        await DAO.getInstance().updateMessageById(messageId, { content: "new content" });
        messages = await DAO.getInstance().getAllGroupMessages(group)
        expect(messages[0].content).toBe("new content");
    });

})



describe("Admin Profile Operations", () => {
    test('Last admin cannot lower his admin privileges', async () => {
        const user = await DAO.getInstance().getUserByName('esnadmin');
        let username = 'esnadmin';
        let password = '12345';
        let id = user._id.toString();
        let status = 'ok';
        let usertype = 'Citizen';
        const result = await DAO.getInstance().changeUserInfo(id, status, username, usertype, password);
        console.log("testest", user.usertype);
        expect(result.success).toBe(false);
        expect(result.message).toBe('There must be at least one administrator active.');
    });

    test('Initial Admin is created', async () => {
        const user = await DAO.getInstance().getUserByName('esnadmin');
        expect(user.username).toBe('esnadmin');
        let passwordresult = await comparePassword(user.password, 'admin');
        expect(passwordresult).toBe(true);
        expect(user.status).toBe('ok');
        expect(user.usertype).toBe('Administrator');
    });

    test('Admin can change Citizen account status to inactive', async () => {
        let user = await DAO.getInstance().createUser('agron', await hashPassword('1234'), 'ok', 'Citizen', false, 'undefined', [])
        let username = 'agron';
        let password = '1234';
        let id = user._id.toString();
        let status = 'Inactive';
        let usertype = 'Citizen';
        const result = await DAO.getInstance().changeUserInfo(id, status, username, usertype, password);
        console.log("resil", result);
        user = await DAO.getInstance().getUserByName(username);
        expect(user.useraccountstatus).toBe('Inactive');
    });

    test('Admin can change Citizen password', async () => {
        let admin = await DAO.getInstance().getUserByName('esnadmin');
        let user = await DAO.getInstance().createUser('agron', '1234', 'ok', 'Citizen', false, 'undefined', [])
        let username = 'agron';
        let password = '12345';
        let id = user._id.toString();
        let status = 'Active';
        let usertype = 'Administrator';
        await DAO.getInstance().changeUserInfo(id, status, username, usertype, await hashPassword(password), admin._id.toString());

        user = await DAO.getInstance().getUserByName(username);
        const compare = await comparePassword(user.password, password);
        expect(compare).toBe(true);
    });

    test('Admin can change Citizen username', async () => {
        let admin = await DAO.getInstance().getUserByName('esnadmin');
        let user = await DAO.getInstance().createUser('agron', '1234', 'ok', 'Citizen', false, 'undefined', [])
        let username = 'agron2';
        let password = '12345';
        let id = user._id.toString();
        let status = 'Active';
        let usertype = 'Administrator';
        await DAO.getInstance().changeUserInfo(id, status, username, usertype, password, admin._id.toString());

        user = await DAO.getInstance().getUserByName(username);
        expect(user.username).toBe(username);

    });

    test('Citizen cannot change Citizen priviledge level', async () => {
        let user = await DAO.getInstance().createUser('agron', await hashPassword('1234'), 'ok', 'Citizen', false, 'undefined', [])
        let username = 'agron';
        let password = '1234';
        let id = user._id.toString();
        let status = 'Inactive';
        let usertype = 'Citizen';
        const result = await DAO.getInstance().changeUserInfo(id, status, username, usertype, password, id);
        expect(result.success).toBe(false);
        expect(result.message).toBe("Only administrator can change usertype");
        user = await DAO.getInstance().getUserByName(username);
        expect(user.useraccountstatus).toBe('Active');
    });

    test('Coordinator cannot change Citizen priviledge level', async () => {
        let user = await DAO.getInstance().createUser('agron', await hashPassword('1234'), 'ok', 'Coordinator', false, 'undefined', [])
        let username = 'agron';
        let password = '1234';
        let id = user._id.toString();
        let status = 'Inactive';
        let usertype = 'Citizen';
        const result = await DAO.getInstance().changeUserInfo(id, status, username, usertype, password, id);
        expect(result.success).toBe(false);
        expect(result.message).toBe("Only administrator can change usertype");
        user = await DAO.getInstance().getUserByName(username);
        expect(user.useraccountstatus).toBe('Active');
    });

    test('Admin can change Citizen priviledge level to Administrator', async () => {
        let admin = await DAO.getInstance().getUserByName('esnadmin');
        let user = await DAO.getInstance().createUser('agron', '1234', 'ok', 'Citizen', false, 'undefined', [])
        let username = 'agron';
        let password = '1234';
        let id = user._id.toString();
        let status = 'Active';
        let usertype = 'Administrator';
        const result = await DAO.getInstance().changeUserInfo(id, status, username, usertype, password, admin._id.toString());

        user = await DAO.getInstance().getUserByName(username);
        expect(user.usertype).toBe('Administrator');
    });

    test('Admin can change Citizen priviledge level to Coordinator', async () => {
        let admin = await DAO.getInstance().getUserByName('esnadmin');
        let user = await DAO.getInstance().createUser('agron', '1234', 'ok', 'Citizen', false, 'undefined', [])
        let username = 'agron';
        let password = '1234';
        let id = user._id.toString();
        let status = 'Active';
        let usertype = 'Coordinator';
        const result = await DAO.getInstance().changeUserInfo(id, status, username, usertype, password, admin._id.toString());

        user = await DAO.getInstance().getUserByName(username);
        expect(user.usertype).toBe('Coordinator');
    });

    test('Admin can change Citizen priviledge level from Coordinator to Citizen', async () => {
        let admin = await DAO.getInstance().getUserByName('esnadmin');
        let user = await DAO.getInstance().createUser('agron', '1234', 'ok', 'Coordinator', false, 'undefined', [])
        let username = 'agron';
        let password = '1234';
        let id = user._id.toString();
        let status = 'Active';
        let usertype = 'Citizen';
        const result = await DAO.getInstance().changeUserInfo(id, status, username, usertype, password, admin._id.toString());

        user = await DAO.getInstance().getUserByName(username);
        expect(user.usertype).toBe('Citizen');
    });

    test('By default user is assigned type Citizen', async () => {
        await loginRegister({ username: "agron", password: "1234" })
        const user = await DAO.getInstance().getUserByName("agron");
        expect(user.usertype).toBe('Citizen');
    });

    test('Citizen cannot change Citizen priviledge level', async () => {
        let user = await DAO.getInstance().createUser('agron', await hashPassword('1234'), 'ok', 'Citizen', false, 'undefined', [])
        let username = 'agron';
        let password = '1234';
        let id = user._id.toString();
        let status = 'Active';
        let usertype = 'Administrator';
        const result = await DAO.getInstance().changeUserInfo(id, status, username, usertype, password, id);
        expect(result.success).toBe(false);
        expect(result.message).toBe("Only administrator can change usertype");
        user = await DAO.getInstance().getUserByName(username);
        expect(user.useraccountstatus).toBe('Active');
    });

    test('Coordinator cannot change Citizen priviledge level', async () => {
        let user = await DAO.getInstance().createUser('agron', await hashPassword('1234'), 'ok', 'Coordinator', false, 'undefined', [])
        let username = 'agron';
        let password = '1234';
        let id = user._id.toString();
        let status = 'Active';
        let usertype = 'Administrator';
        const result = await DAO.getInstance().changeUserInfo(id, status, username, usertype, password, id);
        expect(result.success).toBe(false);
        expect(result.message).toBe("Only administrator can change usertype");
        user = await DAO.getInstance().getUserByName(username);
        expect(user.useraccountstatus).toBe('Active');
    });

    test('Active is the default status of an account', async () => {
        await loginRegister({ username: "agron", password: "1234" })
        const user = await DAO.getInstance().getUserByName("agron");
        expect(user.useraccountstatus).toBe('Active');
    });

    test('Cannot retreive messages of inactive users', async () => {
        let user = await DAO.getInstance().createUser('agron', await hashPassword('1234'), 'ok', 'Coordinator', false, 'undefined', []);
        let username = 'agron';
        let password = '1234';
        let id = user._id.toString();
        let status = 'Inactive';
        let usertype = 'Administrator';
        try {
            await DAO.getInstance().getAllMessages(username);
        } catch (e) {
            expect(e.message).toBe("User is inactive");
        }
    });

    test('retrieves announcement of only active user', async () => {
        let user1 = await DAO.getInstance().createUser('agron', await hashPassword('1234'), 'ok', 'Coordinator', false, 'undefined', []);
        let user2 = await DAO.getInstance().createUser('taige', await hashPassword('1234'), 'ok', 'Coordinator', false, 'undefined', []);
        let user3 = await DAO.getInstance().createUser('kaushik', await hashPassword('1234'), 'ok', 'Coordinator', false, 'undefined', []);
        let user4 = await DAO.getInstance().createUser('daniel', await hashPassword('1234'), 'ok', 'Coordinator', false, 'undefined', []);

        // let username = 'agron';
        await DAO.getInstance().createMessage(user1._id.toString(), "0", 'agron', 'content', '100', 'ok', 'kaushik', true);
        await DAO.getInstance().createMessage(user1._id.toString(), "0", 'agron', 'content', '100', 'ok', 'kaushik', true);
        await DAO.getInstance().createMessage(user2._id.toString(), "0", 'taige', 'content', '100', 'ok', 'kaushik', true);
        await DAO.getInstance().changeUserInfo(user1._id.toString(), 'Inactive', 'taige', 'Coordinator', '1234');
        try {
            const messages = await DAO.getInstance().getAllMessages("announcement");
            messages.forEach(message => {
                expect(message.userid).toBe(user1._id.toString());
            })
        } catch (e) {
            expect(e.message).toBe("User is inactive");
        }
    });

    test('Does not retrieve announcement of inactive users', async () => {
        let user1 = await DAO.getInstance().createUser('agron', await hashPassword('1234'), 'ok', 'Coordinator', false, 'undefined', []);
        let user2 = await DAO.getInstance().createUser('taige', await hashPassword('1234'), 'ok', 'Coordinator', false, 'undefined', []);
        let user3 = await DAO.getInstance().createUser('kaushik', await hashPassword('1234'), 'ok', 'Coordinator', false, 'undefined', []);
        let user4 = await DAO.getInstance().createUser('daniel', await hashPassword('1234'), 'ok', 'Coordinator', false, 'undefined', []);

        // let username = 'agron';
        await DAO.getInstance().createMessage(user1._id.toString(), "0", 'agron', 'content', '100', 'ok', 'kaushik', true);
        await DAO.getInstance().createMessage(user1._id.toString(), "0", 'agron', 'content', '100', 'ok', 'kaushik', true);
        await DAO.getInstance().createMessage(user2._id.toString(), "0", 'taige', 'content', '100', 'ok', 'kaushik', true);
        await DAO.getInstance().changeUserInfo(user1._id.toString(), 'Inactive', 'taige', 'Coordinator', '1234');
        try {
            const messages = await DAO.getInstance().getAllMessages("announcement");
            messages.forEach(message => {
                expect(message.userid).not.toBe(user2._id.toString());
            })
        } catch (e) {
            expect(e.message).toBe("User is inactive");
        }
    });

    test('Admin can change Citizen account status back to active from inactive', async () => {
        let user = await DAO.getInstance().createUser('agron', await hashPassword('1234'), 'ok', 'Citizen', false, 'undefined', [])
        let username = 'agron';
        let password = '1234';
        let id = user._id.toString();
        let status = 'Inactive';
        let usertype = 'Citizen';
        const result = await DAO.getInstance().changeUserInfo(id, status, username, usertype, password);
        user = await DAO.getInstance().getUserByName(username);
        expect(user.useraccountstatus).toBe('Inactive');
        await DAO.getInstance().changeUserInfo(id, 'Active', username, usertype, password);
        user = await DAO.getInstance().getUserByName(username);
        expect(user.useraccountstatus).toBe('Active');
    });

    test("Can't find users which changeUserInfo", async () => {
        jest.spyOn(DAO.getInstance(), 'changeUserInfo').mockImplementation(() => {
            throw new Error('User not found');
        });

        const req = {
            body: {
                id: '1',
                status: 'Active',
                username: 'agron',
                usertype: 'Citizen',
                password: '1234',
                actionerid: '2'
            }
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn()
        };

        await changeUserInfo(req, res);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.send).toHaveBeenCalledWith({ message: 'User not found: ' });

    });


    test("Prevent non-administrators who are not the user from changing the username", async () => {
        const getUserByMock = jest.spyOn(DAO.getInstance(), 'getUserById')
            .mockImplementation((id) => ({ id: '1', username: 'agron', password: '1234', status: 'ok', usertype: 'Citizen', useraccountstatus: 'Active', confirmGroup: 'undefined', group: [] }))
            .mockImplementationOnce(() => ({ id: '2', username: 'agron2', password: '1234', status: 'ok', usertype: 'Citizen', useraccountstatus: 'Active', confirmGroup: 'undefined', group: [] }));


        jest.spyOn(DAO.getInstance(), "getUserById").mockImplementation(() => ({
            getUserByMock
        }));
        const req = {
            body: {
                id: '1',
                username: 'newusername',
                actionerid: '2' // Actioner is not the original user and not an admin
            }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn()
        };

        await changeUserInfo(req, res);

        // Assertions
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.send).toHaveBeenCalledWith({ message: "Only user or administrator can change username" });
    });

    test("Prevent from inactive last one administrator.", async () => {
        const mockUser = {
            id: '1',
            username: 'agron',
            password: '1234',
            status: 'ok',
            usertype: 'Administrator',
            useraccountstatus: 'Active',
            confirmGroup: [],
            group: []
        };

        jest.spyOn(DAO.getInstance(), 'getUserById')
            .mockImplementation(async (id) => {
                if (id === '1') {
                    return mockUser;
                }
                return null;
            });

        jest.spyOn(DAO.getInstance(), 'changeUserInfo')
            .mockResolvedValue({});


        jest.spyOn(DAO.getInstance(), 'getAdministrators')
            .mockResolvedValue([mockUser]);

        const req = {
            body: {
                id: '1',
                username: 'agron',
                actionerid: '1',
                useraccountstatus: 'Inactive'
            }
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn()
        };

        await changeUserInfo(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.send).toHaveBeenCalledWith({ message: "There must be at least one administrator active." });
    });

    test("should allow administrators to change username", async () => {
        const mockUser = {
            id: '1',
            username: 'agron',
            password: '1234',
            status: 'ok',
            usertype: 'Citizen',
            useraccountstatus: 'Active',
            confirmGroup: [],
            group: []
        };
        const mockAdmin = {
            id: '2',
            username: 'admin',
            password: '1234',
            status: 'ok',
            usertype: 'Administrator',
            useraccountstatus: 'Active',
            confirmGroup: [],
            group: []
        };

        jest.spyOn(DAO.getInstance(), 'getUserById')
            .mockImplementation(async (id) => {
                if (id === '1') {
                    return mockUser;
                } else if (id === '2') {
                    return mockAdmin;
                }
                return null;
            });

        jest.spyOn(DAO.getInstance(), 'changeUserInfo')
            .mockResolvedValue({});

        jest.spyOn(DAO.getInstance(), 'getAdministrators')
            .mockResolvedValue([mockUser]);

        const req = {
            body: {
                id: '1',
                username: 'newusername',
                actionerid: '2'
            }
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn()
        };
        await changeUserInfo(req, res);
        const messageSent = res.send.mock.calls[0][0].data.message;

        expect(res.status).toHaveBeenCalledWith(200);
        expect(messageSent).toBe("User information updated successfully");
    });

    test('administrator can change password', async () => {
        const mockUser = {
            id: '1',
            username: 'agron',
            password: '1234',
            status: 'ok',
            usertype: 'Citizen',
            useraccountstatus: 'Active',
            confirmGroup: [],
            group: []
        };
        const mockAdmin = {
            id: '2',
            username: 'admin',
            password: '1234',
            status: 'ok',
            usertype: 'Administrator',
            useraccountstatus: 'Active',
            confirmGroup: [],
            group: []
        };

        jest.spyOn(DAO.getInstance(), 'getUserById')
            .mockImplementation(async (id) => {
                if (id === '1') {
                    return mockUser;
                } else if (id === '2') {
                    return mockAdmin;
                }
                return null;
            });

        jest.spyOn(DAO.getInstance(), 'changeUserInfo')
            .mockResolvedValue({});

        jest.spyOn(DAO.getInstance(), 'getAdministrators')
            .mockResolvedValue([mockAdmin]);

        const req = {
            body: {
                id: '1',
                username: 'agron',
                password: 'newpassword',
                actionerid: '2'
            }
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn()
        };
        await changeUserInfo(req, res);
        const messageSent = res.send.mock.calls[0][0].data.message;

        expect(res.status).toHaveBeenCalledWith(200);
        expect(messageSent).toBe("User information updated successfully");
    });

    test('User cannot change other password', async () => {
        const mockUser = {
            id: '1',
            username: 'agron',
            password: '1234',
            status: 'ok',
            usertype: 'Citizen',
            useraccountstatus: 'Active',
            confirmGroup: [],
            group: []
        };
        const mockUser2 = {
            id: '2',
            username: 'agron2',
            password: '1234',
            status: 'ok',
            usertype: 'Citizen',
            useraccountstatus: 'Active',
            confirmGroup: [],
            group: []
        };
        jest.spyOn(DAO.getInstance(), 'getUserById')
            .mockImplementation(async (id) => {
                if (id === '1') {
                    return mockUser;
                } else if (id === '2') {
                    return mockUser2;
                }
                return null;
            });

        jest.spyOn(DAO.getInstance(), 'changeUserInfo')
            .mockResolvedValue({});

        const req = {
            body: {
                id: '1',
                username: 'agron',
                password: 'newpassword',
                actionerid: '2'
            }
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn()
        };
        await changeUserInfo(req, res);
        console.log(res.send.mock.calls[0][0]);
        const messageSent = res.send.mock.calls[0][0].message;
        expect(res.status).toHaveBeenCalledWith(400);
        expect(messageSent).toBe("Only user or administrator can change password");
    });

    test("Only administrators can change user's usertype", async () => {
        const mockUser = {
            id: '1',
            username: 'agron',
            password: '1234',
            status: 'ok',
            usertype: 'Citizen',
            useraccountstatus: 'Active',
            confirmGroup: [],
            group: []
        };
        const mockAdmin = {
            id: '2',
            username: 'admin',
            password: '1234',
            status: 'ok',
            usertype: 'Administrator',
            useraccountstatus: 'Active',
            confirmGroup: [],
            group: []
        };
        jest.spyOn(DAO.getInstance(), 'getUserById')
            .mockImplementation(async (id) => {
                if (id === '1') {
                    return mockUser;
                } else if (id === '2') {
                    return mockAdmin;
                }
                return null;
            });
        jest.spyOn(DAO.getInstance(), 'changeUserInfo')
            .mockResolvedValue({});

        jest.spyOn(DAO.getInstance(), 'getAdministrators')
            .mockResolvedValue([mockAdmin]);
        const req = {
            body: {
                id: '1',
                username: 'agron',
                usertype: 'Coordinator',
                actionerid: '2'
            }
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn()
        };
        await changeUserInfo(req, res);
        const messageSent = res.send.mock.calls[0][0].data.message;
        expect(res.status).toHaveBeenCalledWith(200);
        expect(messageSent).toBe("User information updated successfully");

    });

    test('Get user profile', async () => {
        const mockUser = {
            id: '1',
            username: 'agron',
            password: '1234',
            status: 'ok',
            usertype: 'Citizen',
            useraccountstatus: 'Active',
            confirmGroup: [],
            group: []
        };
        jest.spyOn(DAO.getInstance(), 'getUserById')
            .mockResolvedValue(mockUser);
        const req = {
            params: {
                id: '1'
            }
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn()
        };
        await getUserProfile(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith(mockUser);
    });
    test('User profile not found', async () => {
        jest.spyOn(DAO.getInstance(), 'getUserById')
            .mockResolvedValue(null);
        const req = {
            params: {
                id: '1'
            }
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn()
        };
        await getUserProfile(req, res);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.send).toHaveBeenCalledWith({ message: "User not found" });
    });
    test('Failed to get user profile', async () => {
        jest.spyOn(DAO.getInstance(), 'getUserById')
            .mockImplementation(() => {
                throw new Error('Failed to get user profile');
            });
        const req = {
            params: {
                id: '1'
            }
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn()
        };
        await getUserProfile(req, res);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith({ message: "Failed to get user profile" });
    });


    test('User action validation', async () => {
        const mockUser = {
            id: '1',
            username: 'agron',
            password: '1234',
            status: 'ok',
            usertype: 'Citizen',
            useraccountstatus: 'Active',
            confirmGroup: [],
            group: []
        };
        jest.spyOn(DAO.getInstance(), 'getUserById')
            .mockResolvedValue(mockUser);
        const req = {
            params: {
                id: '1'
            }
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn()
        };
        await UserActionValidation(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith({ data: mockUser.usertype });
    });

    test("User action validation user not found", async () => {
        jest.spyOn(DAO.getInstance(), 'getUserById')
            .mockResolvedValue(null);
        const req = {
            params: {
                id: '1'
            }
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn()
        };
        await UserActionValidation(req, res);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.send).toHaveBeenCalledWith({ message: "User not found" });
    });

    test("User action validation failed to get user profile", async () => {
        jest.spyOn(DAO.getInstance(), 'getUserById')
            .mockImplementation(() => {
                throw new Error('Failed to get user profile');
            });
        const req = {
            params: {
                id: '1'
            }
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn()
        };
        await UserActionValidation(req, res);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith({ message: "Failed to get user profile" });
    });

    test("create a coordinator", async () => {
        const user = await DAO.getInstance().createUser('agron', await hashPassword('1234'), 'ok', 'coordinator', false, 'undefined', [])
        expect(user.username).toBe('agron');
        expect(user.usertype).toBe('Coordinator');
    })

});