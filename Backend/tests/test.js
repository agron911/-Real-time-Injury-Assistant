import { connect, closeDatabase, clearDatabase } from './db-handler';
import { hashPassword, comparePassword } from "../utils/passwordUtils.js";
import DAO from '../model/dao.js';
import { loginRegister } from '../controller/joinCommunity.js';
import Citizen from '../model/user-Citizen.js';
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

describe("Facility operations tests", () => {
    test("Facility is stored", async ()=>{
        let name = "Some facility"
        let address = "Some street irrelevant"
        let latitude = 54.45
        let longitude = -228.4
        let type = "Emergency Room"
        let hours = "24/7"
        await DAO.getInstance().addFacility(name, latitude, longitude, type, address, hours);
        let facility = DAO.getInstance().getFacility(name);
        expect(facility.name).toBe('Some facility')
    })
    test("Update Facility info Updates facility Info", async()=>{
        let name = "Some facility"
        let address = "Some street irrelevant"
        let latitude = 54.45
        let longitude = -228.4
        let type = "Emergency Room"
        let hours = "24/7"
        let newhours = "6-18"
        await DAO.getInstance().addFacility(name, latitude, longitude, type, address, hours);
        await DAO.getInstance().updateFacilityInfo(name, newhours);
        let facility = DAO.getInstance().getFacility(name);
        expect(facility.hours).toBe(newhours)
    })
    test("Facility reportedclosed is by default initialized to false", async()=>{
        let name = "Some facility"
        let address = "Some street irrelevant"
        let latitude = 54.45
        let longitude = -228.4
        let type = "Emergency Room"
        let hours = "24/7"
        await DAO.getInstance().addFacility(name, latitude, longitude, type, address, hours);
        let facility = DAO.getInstance().getFacility(name);
        expect(facility.reportedclosed).toBe(false)
    })
    test("Mark Facility Requested to Delete", async()=>{
        let name = "Some facility"
        let address = "Some street irrelevant"
        let latitude = 54.45
        let longitude = -228.4
        let type = "Emergency Room"
        let hours = "6-69"
        await DAO.getInstance().addFacility(name, latitude, longitude, type, address, hours);
        await DAO.getInstance().deleteFacility(name);
        await DAO.getInstance().DeleteFacility(name);
        let facility = DAO.getInstance().getFacility(name);
        expect(facility.reportedclosed).toBe(true);
    })
    test("Search for Facilities for open wounds/difficulty breathing only returns Emergency rooms", async()=>{
        let name = "Some facility"
        let address = "Some street irrelevant"
        let latitude = 54.45
        let longitude = -228.4
        let type = "Emergency Room"
        let hours = "24/7"
        await DAO.getInstance().addFacility(name, latitude, longitude, type, address, hours);
        let name2 = "Some facility 2"
        let address2 = "Some street irrelevant 2"
        let latitude2 = 54.49
        let longitude2 = -228.47
        let type2 = "Emergency Room"
        let hours2 = "24/7"
        await DAO.getInstance().addFacility(name2, latitude2, longitude2, type2, address2, hours2);
        let result = await DAO.searchFacility("Open Wound", "Yes");
        expect(result).not.toBeNull();
    })
    test("If name exists new facility is not added", async()=>{
        let name = "Some facility"
        let address = "Some street irrelevant"
        let latitude = 54.45
        let longitude = -228.4
        let type = "Emergency Room"
        let hours = "24/7"
        await DAO.getInstance().addFacility(name, latitude, longitude, type, address, hours);
        let name2 = "Some facility"
        let address2 = "Some street irrelevant 2"
        let latitude2 = 54.49
        let longitude2 = -228.47
        let type2 = "Emergency Room"
        let hours2 = "24/7"
        await DAO.getInstance().addFacility(name2, latitude2, longitude2, type2, address2, hours2);
        let result = DAO.getInstance().getFacilities();
        expect(result.length).toBe(1);
    })
    test("Facility not in santa clara county is not added", async()=>{
        let name = "Some facility"
        let address = "Some street irrelevant"
        let latitude = 35.429055
        let longitude = -120.832633
        let type = "Emergency Room"
        let hours = "24/7"
        let result = await DAO.getInstance().addFacility(name, latitude, longitude, type, address, hours);
        expect(result).toBeNull;
    } )
    test("Facility in Santa Clara County is added", async()=>{
        let name = "Some facility"
        let address = "Some street irrelevant"
        let latitude = 37.396276
        let longitude = -121.893756
        let type = "Emergency Room"
        let hours = "24/7"
        let result = await DAO.getInstance().addFacility(name, latitude, longitude, type, address, hours);
        expect(result.length).toBe(1);
    })
    test("Search for facilities for non mobility-restricting injuries returns only urgent care", async()=>{
        let name = "Some facility"
        let address = "Some street irrelevant"
        let latitude = 54.45
        let longitude = -228.4
        let type = "Emergency Room"
        let hours = "24/7"
        await DAO.getInstance().addFacility(name, latitude, longitude, type, address, hours);
        let name2 = "Some facility 2"
        let address2 = "Some street irrelevant 2"
        let latitude2 = 54.49
        let longitude2 = -228.47
        let type2 = "Urgent Care"
        let hours2 = "24/7"
        await DAO.getInstance().addFacility(name2, latitude2, longitude2, type2, address2, hours2);
        let name3 = "Some facility 3"
        let address3 = "Some street irrelevant 3"
        let latitude3 = 54.49
        let longitude3 = -228.47
        let type3 = "Urgent Care"
        let hours3 = "24/7"
        await DAO.getInstance().addFacility(name3, latitude3, longitude3, type3, address3, hours3);
        let result = await DAO.searchFacility("Sprain", "No");
        result.forEach(facility=>{
            expect(facility.type).toBe("Urgent Care")
        })
    })
    test("Search Facility for mobility-restricting injuries returns only emergency rooms", async()=>{
        let name = "Some facility"
        let address = "Some street irrelevant"
        let latitude = 54.45
        let longitude = -228.4
        let type = "Emergency Room"
        let hours = "24/7"
        await DAO.getInstance().addFacility(name, latitude, longitude, type, address, hours);
        let name2 = "Some facility 2"
        let address2 = "Some street irrelevant 2"
        let latitude2 = 54.49
        let longitude2 = -228.47
        let type2 = "Emergency Room"
        let hours2 = "24/7"
        await DAO.getInstance().addFacility(name2, latitude2, longitude2, type2, address2, hours2);
        let name3 = "Some facility 3"
        let address3 = "Some street irrelevant 3"
        let latitude3 = 54.49
        let longitude3 = -228.47
        let type3 = "Urgent Care"
        let hours3 = "24/7"
        await DAO.getInstance().addFacility(name3, latitude3, longitude3, type3, address3, hours3);
        let result = await DAO.searchFacility("Sprain", "Yes");
        result.forEach(facility=>{
            expect(facility.type).toBe("Emergency Room")
        })
    })
})