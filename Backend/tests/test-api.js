import { connect, closeDatabase, clearDatabase } from './db-handler';
// import httpServer from '../../server-test.js'
import Server from '../../server.js';
import request from 'supertest';
import DAO from '../model/dao.js';
import { hashPassword, comparePassword } from "../utils/passwordUtils.js";
import {jest} from '@jest/globals';

/**
 * Connect to a new in-memory database before running any tests.
 */
beforeAll(async () => {
    await connect();
    Server.create(true);
});

/**
 * Clear all test data after every test.
 */
afterEach(async () => await clearDatabase());

/**
 * Remove and close the db and server.
 */
afterAll((done) => {
    const res =  closeDatabase();
    res.then(()=>{
        done();
    }
    )
});


describe("Test Join Community API", () => {
    test("/Get community", async () => {
        const response = await request(Server.instance.app).get("/community");
        expect(response.statusCode).toBe(200);
    });

    test("/Post users resigtration", async () => {
        const data = {
            username: 'agron',
            password: '1234'
        }
        const response = await request(Server.instance.app).post("/users/").send(data);
        expect(response.statusCode).toBe(202);
        expect(response.body.data.username).toBe('agron');
        const response2 = await request(Server.instance.app).post("/users/").send(data);
        expect(response2.statusCode).toBe(400);
        expect(response2.body.message).toBe('User already exists!');
    })

    test("/Post users verification-username/passoword", async () => {
        const data = {
            username: 'ag',
            password: '1234'
        }
        const response = await request(Server.instance.app).post("/users/verification").send(data);
        expect(response.statusCode).toBe(401);
        expect(response.body.message).toBe('Username length invalid');
        const data2 = {
            username: 'agron',
            password: '123'
        }
        const response2 = await request(Server.instance.app).post("/users/verification").send(data2);
        expect(response2.statusCode).toBe(402);
        expect(response2.body.message).toBe('Password length invalid');
        const data3 = {
            username: 'all',
            password: '1234'
        }
        const response3 = await request(Server.instance.app).post("/users/verification").send(data3);
        expect(response3.statusCode).toBe(403);
        expect(response3.body.message).toBe('Username prohibited');
        const data4 = {
            username: 'agron3',
            password: '1234'
        }
        const response4 = await request(Server.instance.app).post("/users/verification").send(data4);
        expect(response4.statusCode).toBe(201);
        
        expect(response4.body.message).toBe('User does not exist');

        await request(Server.instance.app).post("/users").send(data4);
        const response6 = await request(Server.instance.app).post("/users/verification").send(data4);

        expect(response6.statusCode).toBe(206);
        expect(response6.body.message).toBe('Join successful');
        const data7 = {
            username: 'agron3',
            password: '12345'
        }
        const response7 = await request(Server.instance.app).post("/users/verification").send(data7);
        expect(response7.statusCode).toBe(400);
        
        expect(response7.body.message).toBe('Password mismatch');
    })

    test("/Post users acknowledgement", async () => {
        const data = {
            username: 'agron',
            password: '1234'
        }
        await request(Server.instance.app).post("/users").send(data);
        const response = await request(Server.instance.app).post("/users/acknowledgement").send({ username: 'agron' });
        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe('Acknowledged');

        const response2 = await request(Server.instance.app).post("/users/acknowledgement").send({ username: 'agron1' });
        expect(response2.statusCode).toBe(400);
        expect(response2.body.message).toBe('User does not exist');

    })

})

describe('Test Login-Logoff API', () => {
    test('/Get all users', async () => {
        const data = {
            username: 'agron',
            password: '1234'
        }
        await request(Server.instance.app).post("/users").send(data);
        const response = await request(Server.instance.app).get("/users");
        expect(response.statusCode).toBe(200);
    })
})


describe('Test Chat Public API', () => {

    test('/Post public message with proper info', async () => {
        const data = {
            userid: '0',
            receiverid: '1',
            username: 'agron',
            content: 'hello',
            timestamp: '100',
            status: 'ok',
            receiver: 'all'
        }
        const response = await request(Server.instance.app).post("/messages/public").send(data);
        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe('message received');


        const data2 = {
            username: 'agron',
            content: 'hello',
            timestamp: '100',
            status: 'ok',
        }
        const response2 = await request(Server.instance.app).post("/messages/public").send(data2);
        expect(response2.statusCode).toBe(400);

    })

    test('/Post public message invalid info', async () => {
        const data2 = {
            username: 'agron',
            content: 'hello',
            timestamp: '100',
            status: 'ok',
        }
        const response2 = await request(Server.instance.app).post("/messages/public").send(data2);
        expect(response2.statusCode).toBe(400);

    })

    test('/Get all public messages', async () => {
        const data = {
            userid: '0',
            receiverid: '1',
            username: 'agron',
            content: 'hello',
            timestamp: '100',
            status: 'ok',
            receiver: 'all'
        }
        await request(Server.instance.app).post("/messages/public").send(data);
        const response = await request(Server.instance.app).get("/messages/public");
        let msg = response.body.archive.filter(msg => msg.username === data.username && msg.timestamp === data.timestamp)
        expect(response.statusCode).toBe(200);
        expect(msg[0].content).toBe('hello');
    })
})


describe('Test Share Status API', () => {

    test("/Get user status", async () => {
        await DAO.getInstance().createUser('agron', await hashPassword('1234'), 'ok', 'Citizen', false, 'undefined', []);
        let user = await DAO.getInstance().getUserByName('agron');
        const response = await request(Server.instance.app).get(`/user/status/${user._id.toString()}`);
        expect(response.statusCode).toBe(200);
        expect(response.body.status).toBe('ok');
    });


    test('/Update user status', async () => {
        await DAO.getInstance().createUser('agron1', await hashPassword('1234'), 'ok', 'Citizen', false,  'undefined', [])
        const response = (await request(Server.instance.app).put('/user/status/agron1').send({ status: 'help' }));
        const user_status = await DAO.getInstance().getUserByName('agron1');
        expect(response.statusCode).toBe(200);
        expect(user_status.status).toBe('help');
    })


})


describe('Testing Chat privately API', () => {

    test("/Get all latest private messages", async () => {
        let username1 = 'agron';
        let username2 = 'taige';
        const user1 = await DAO.getInstance().createUser(username1, '1234', 'ok', 'Citizen', false);
        const user2 = await DAO.getInstance().createUser(username2, '1234', 'ok', 'Citizen', false);
        
        const msg = await DAO.getInstance().createMessage(user1._id.toString(), user2._id.toString(), username1, "a send to T", "100", 'ok', username2, true)
        // console.log("here1", msg);
        const msg2 = await DAO.getInstance().createMessage(user2._id.toString(), user1._id.toString(), username2, "T send to a", "100", 'ok', username1, true)
        // console.log("here2", "/messages/private?username1=" + username1 + "&username2=" + username2);
        const response = await request(Server.instance.app).get("/messages/private?username1=" + username1 + "&username2=" + username2);
        // console.log("here3", response);
        expect(response.statusCode).toBe(200);
        expect(response.body.archive[0].content).toContain('a send to T');
        expect(response.body.archive[1].content).toContain('T send to a');
    });


    test('/Get specific user unread msg', async () => {
        let username1 = 'agron';
        let username2 = 'taige';
        const user1 = await DAO.getInstance().createUser(username1, '1234', 'ok', 'Citizen', false);
        const user2 = await DAO.getInstance().createUser(username2, '1234', 'ok', 'Citizen', false);
        // let user3 = 'kaushik';
        await DAO.getInstance().createMessage(user1._id.toString(), user2._id.toString(), username1, "a send to T", "100", 'ok', username2, false)
        await DAO.getInstance().createMessage(user2._id.toString(), user1._id.toString(), username2, "k send to T", "100", 'ok', username1, false)
        const response = await request(Server.instance.app).get("/messages/private?username1=" + username1 + "&username2=" + username2);
        expect(response.statusCode).toBe(200);
        expect(response.body.archive[0].content).toBe('a send to T');
        expect(response.body.archive[1].content).toBe('k send to T');
    })

    test('/Post msg', async () => {
        let username1 = 'agron';
        let username2 = 'taige';
        const user1 = await DAO.getInstance().createUser(username1, '1234', 'ok', 'Citizen', false);
        const user2 = await DAO.getInstance().createUser(username2, '1234', 'ok', 'Citizen', false);
        const body = { userid: user1._id, content: "a send to T", status: 'help', username: username1,   receiver: username2};
        const response = ((await request(Server.instance.app).post('/messages/private/').send(body)));
        const user2_msg = await DAO.getInstance().getUnreadMessages(username2);
        expect(response.statusCode).toBe(200);
        expect(user2_msg[0].content).toBe('a send to T');
    })

})


// post announcement

describe('Test Post Announcement API', () => {
    test('/Post announcement', async () => {
        let username1 = 'agron';
        const user1 = await DAO.getInstance().createUser(username1, '1234', 'ok', 'Citizen', false);
        const data = {
            username: 'agron',
            content: 'hello',
            timestamp: '100',
            status: 'ok',
            receiver: 'all',
            userid: user1._id.toString(),
        }
        const response = await request(Server.instance.app).post("/messages/announcement").send(data);
        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe('message received');

        const data2 = {
            username: 'agron',
            content: 'hello',
            timestamp: '100',
            status: 'ok',
            userid: user1._id.toString(),
        }
        const response2 = await request(Server.instance.app).post("/messages/announcement").send(data2);
        expect(response2.statusCode).toBe(400);
        expect(response2.body.message).toBe("database failure");
    })

    test('/Get all announcement messages', async () => {
        let username1 = 'agron';
        const user1 = await DAO.getInstance().createUser(username1, '1234', 'ok', 'Citizen', false);
        const data = {
            username: 'agron',
            content: 'hello',
            timestamp: '100',
            status: 'ok',
            receiver: 'announcement',
            userid: user1._id.toString(),
        }
        await request(Server.instance.app).post("/messages/announcement").send(data);
        const response = await request(Server.instance.app).get("/messages/announcement");
        let msg = response.body.archive.filter(msg => msg.username === data.username && msg.timestamp === data.timestamp)
        expect(response.statusCode).toBe(200);
        expect(msg[0].content).toBe('hello');

        jest.spyOn(DAO.getInstance(), 'getAllMessages').mockImplementation(() => { throw new Error() });
        const response2 = await request(Server.instance.app).get("/messages/announcement");
        expect(response2.statusCode).toBe(400);
        expect(response2.body.message).toBe('database failure');

    })
})

// search information
// router.get("/messages/public/:content/:limit", searchByPublicMessage);
// router.get("/messages/private/:sender/:receiver/:content/:limit", searchByPrivateMessages);

describe('Test Search Info API', () => {
    test('/Get public messages by content', async () => {
        let username1 = 'agron';
        const user1 = await DAO.getInstance().createUser(username1, '1234', 'ok', 'Citizen', false);
        const data = {
            username: 'agron',
            content: 'hello',
            timestamp: '100',
            status: 'ok',
            receiver: 'all',
            userid: user1._id.toString(),
        }
        await request(Server.instance.app).post("/messages/public").send(data);
        const response = await request(Server.instance.app).get("/messages/public/search?content=hello&limit=1");
        let msg = response.body.search_result.filter(msg => msg.username === data.username && msg.timestamp === data.timestamp)
        expect(response.statusCode).toBe(200);
        expect(msg[0].content).toBe('hello');

        jest.spyOn(DAO.getInstance(), 'search_by_public_messages').mockImplementation(() => { throw new Error() });
        const response2 = await request(Server.instance.app).get("/messages/public/search?content=hello&limit=1");
        expect(response2.statusCode).toBe(400);
        expect(response2.body.message).toBe('search_by_public_messages failure');

    })

    test('/Get private messages by content', async () => {
        let username1 = 'agron';
        let username2 = 'taige';
        const user1 = await DAO.getInstance().createUser(username1, '1234', 'ok', 'Citizen', false);
        const user2 = await DAO.getInstance().createUser(username2, '1234', 'ok', 'Citizen', false);
        const data ={
            username: 'agron',
            content: "A_send",
            timestamp: "100",
            status: 'ok',
            receiver: 'taige',
            userid: user1._id.toString(),
        }
        console.log("here5")

        await request(Server.instance.app).post("/messages/private").send(data);
        console.log("here4")

        const response = (await request(Server.instance.app).get("/messages/private/search?receiver=" + data.username + "&sender=" + data.receiver + "&content=A_send&limit=1"));
        console.log("here3")
        let msg = response.body.search_result.filter(msg => msg.username === data.username)
        expect(response.statusCode).toBe(200);
        expect(msg[0].content).toContain('A_send');
        console.log("here");
        jest.spyOn(DAO.getInstance(), 'search_by_private_messages').mockImplementation(() => { throw new Error() });
        const response2 = (await request(Server.instance.app).get("/messages/private/search?receiver=" + data.username + "&sender=" + data.receiver + "&content=A_send&limit=1"));
        console.log("here2");
        expect(response2.statusCode).toBe(400);
        expect(response2.body.message).toBe('search_by_private_messages failure');

    })


    test('/Get all users by username', async () => {
        const data = {
            username: 'agron',
            password: '1234'
        }
        await request(Server.instance.app).post("/users").send(data);
        const response = await request(Server.instance.app).get("/users/username/search?username=agron");
        expect(response.statusCode).toBe(200);
        expect(response.body.search_result[0].username).toBe('agron');
    })

    test('/Get all users by status', async () => {
        const data = {
            username: 'agron',
            password: '1234',
        }
        await request(Server.instance.app).post("/users").send(data);
        await request(Server.instance.app).put("/user/status/agron").send({ status: 'ok' });
        const response = await request(Server.instance.app).get("/users/status/search?status=ok");
        expect(response.statusCode).toBe(200);
        expect(response.body.search_result[0].username).toBe('agron');
    })

    test('/Get all announcement messages by content', async () => {
        let username1 = 'agron';
        const user1 = await DAO.getInstance().createUser(username1, '1234', 'ok', 'Citizen', false);
        const data = {
            username: 'agron',
            content: 'hello',
            timestamp: '100',
            status: 'ok',
            receiver: 'announcement',
            userid: user1._id.toString(),
        }
        await request(Server.instance.app).post("/messages/announcement").send(data);
        const response = await request(Server.instance.app).get("/messages/announcement/search?content=hello&limit=1");
        let msg = response.body.search_result.filter(msg => msg.username === data.username && msg.timestamp === data.timestamp)
        expect(response.statusCode).toBe(200);
        expect(msg[0].content).toBe('hello');

        jest.spyOn(DAO.getInstance(), 'search_by_announcement').mockImplementation(() => { throw new Error() });
        const response2 = await request(Server.instance.app).get("/messages/announcement/search?content=hello&limit=1");
        expect(response2.statusCode).toBe(400);
        expect(response2.body.message).toBe('search_by_announcement failure');

    })

})

describe("Facilities operations tests", ()=>{
    test("Facility outside of Santa Clara County not added", async()=>{
        let data = {
            name:"Name1",
            address:"Address1",
            type:"Emergency Room",
            latitude: 38.97089,
            longitude: -122.34567,
            hours:"24/7"
        }
        let response = await request(Server.instance.app).post("/facilities/newfacility").send(data)
        expect(response.statusCode).toBe(401);
    })
    test("Facility inside of Santa Clara County added", async()=>{
        let data = {
            name:"Name1",
            address:"Address1",
            type:"Emergency Room",
            latitude: 37.362037,
            longitude: -121.848599,
            hours:"24/7"
        }
        let response = await request(Server.instance.app).post("/facilities/newfacility").send(data)
        expect(response.statusCode).toBe(200);
    })
    test("Facility updated info is properly updated", async()=>{
        let data = {
            name:"Name1",
            address:"Address1",
            type:"Emergency Room",
            latitude: 37.362037,
            longitude: -121.848599,
            hours:"24/7"
        }
        await request(Server.instance.app).post("/facilities/newfacility").send(data)
        await request(Server.instance.app).patch("/facilities/newinfo").send({name:"Name1", hours:"newhrs"})
        let result = await request(Server.instance.app).get("/facilities/Name1").send()
        expect(result.body.hours).toBe("newhrs");
    })
    test("Can get facility by name", async()=>{
        let data = {
            name:"Name1",
            address:"Address1",
            type:"Emergency Room",
            latitude: 37.362037,
            longitude: -121.848599,
            hours:"24/7"
        }
        await request(Server.instance.app).post("/facilities/newfacility").send(data)
        let result = await request(Server.instance.app).get("/facilities/Name1").send()
        expect(result.body.name).toBe("Name1");
    })
    test("Facility delete request is submited and noted in the database", async()=>{
        let data = {
            name:"Name1",
            address:"Address1",
            type:"Emergency Room",
            latitude: 37.362037,
            longitude: -121.848599,
            hours:"24/7"
        }
        await request(Server.instance.app).post("/facilities/newfacility").send(data)
        await request(Server.instance.app).delete("/facilities?fname=Name1").send()
        let result = await request(Server.instance.app).get("/facilities/Name1").send()
        expect(result.body.reportedclosed).toBe(true);
    })

    test("Search facilities for injuries requiring emergency room", async()=>{
        let data = {
            name:"Name1",
            address:"Address1",
            type:"Emergency Room",
            latitude: 37.362037,
            longitude: -121.848599,
            hours:"24/7"
        }
        await request(Server.instance.app).post("/facilities/newfacility").send(data)
        let data2 = {
            name:"Name2",
            address:"Address2",
            type:"Urgent Care",
            latitude: 37.362033,
            longitude: -121.848511,
            hours:"24/7"
        }
        await request(Server.instance.app).post("/facilities/newfacility").send(data2)
        let results = await request(Server.instance.app).get("/facility/search?description=Open-Wound&mobility=No").send()
        expect(results.body.searchresult[0].type).toBe("Emergency Room")
    })
    

})
describe("Test First Aid API", () => {
    test('/Get Injuries with injury in torso', async () => {
        let username = 'dummy';
        let reported = true;
        let timestamp = new Date().toString();
        let parts = 'torso';
        let bleeding = true;
        let numbness = false;
        let conscious = true;
        await DAO.getInstance().createInjury(username, reported, timestamp, parts, bleeding, numbness, conscious)
        const response = await request(Server.instance.app).get("/injuries/" + username);
        expect(response.statusCode).toBe(200);
        expect(response.body.injury.username).toBe(username);
    })

    test('/Get Injuries when no injuries are identified', async () => {
        jest.spyOn(DAO.getInstance(), 'getInjuryByUser').mockImplementation(() => { throw new Error() });
        const response = await request(Server.instance.app).get("/injuries/" + `username`);
        expect(response.statusCode).toBe(400);
    })



})

describe("Test Waitlists API", () => {
    test('/Get Waitlist citizens', async () => {
        let medname = 'dummy';
        let description = 'dummy description';
        await DAO.getInstance().createWaitlist(medname, description)
        const response = await request(Server.instance.app).get("/waitlists/citizens/:username" + `username`);
        expect(response.statusCode).toBe(200);
    })

    test('/Get Waitlist citizens with created users', async () => {
        let medname = 'dummy';
        let description = 'dummy description';
        await DAO.getInstance().createWaitlist(medname, description)
        const response = await request(Server.instance.app).get("/waitlists/citizens/:username" + `username`);
        expect(response.body.waitlists[0].name).toBe(medname);
    })

    test('/Get Waitlist citizens ', async () => {
        jest.spyOn(DAO.getInstance(), 'getWaitlist').mockImplementation(() => { throw new Error() });
        const response = await request(Server.instance.app).get("/waitlists/citizens/:username" + `username`);
        expect(response.statusCode).toBe(400);
    })

    test('/Post create waitlist', async () => {
        let medname = 'dummy';
        let description = 'dummy description';
        const response = await request(Server.instance.app).post("/waitlists/providers").send({ medname: medname, description: description });
        expect(response.statusCode).toBe(200);
    })


})
describe('Emergency services', ()=>{
    
    test("/Get emergencyServices", async () => {
        const response = await request(Server.instance.app).get("/emergencyServices");
        expect(response.statusCode).toBe(200);
    });

    test("/put /user/:username/esp: Register user as ESP", async () => {
        const username = 'testuser';
        await DAO.getInstance().createUser(username, '1234', 'ok', 'Citizen', false);
        const response = (await request(Server.instance.app).put('/user/'+username+"/esp").send({esp: true}));
        expect(response.status).toBe(200);
        // Check if user updated in database;
        const citizen = await DAO.getInstance().getUserByName(username);
        expect(citizen.esp).toBe(true);
    })

    test("/post request, also ensure the when request is created it is set to unresolved", async () => {
        const username = 'testuser';
        await DAO.getInstance().createUser(username, '1234', 'ok', 'Citizen', false);
        const response = (await request(Server.instance.app).post('/request').send({ username: username, content: "help", severity: "Dog" }));
        expect(response.status).toBe(200);
        // Check if request exists in database;
        let req = await DAO.getInstance().getRequestById(response.body.id);
        expect(req.username).toBe(username);
        expect(req.content).toBe('help');
        expect(req.status).toBe('UNRESOLVED');
        expect(req.severity).toBe('Dog');
    })

    test("/put request, ensure that only the field that is being attempted to update has updated", async () => {
        const username = 'testuser';
        await DAO.getInstance().createUser(username, '1234', 'ok', 'Citizen', false);
        const request1 = (await request(Server.instance.app).post('/request').send({ username: username, content: "help", severity: "Dog" }));
        const response = (await request(Server.instance.app).put('/request/'+request1.body.id).send({ status: "RESOLVED" }));
        let req = await DAO.getInstance().getRequestById(response.body.id);
        expect(req.username).toBe(username);
        expect(req.content).toBe('help');
        expect(req.status).toBe('RESOLVED');
        expect(req.severity).toBe('Dog');
        expect(response.body.status).toBe("RESOLVED");
    })

    test("/delete request", async () => {
        const username = 'testuser';
        await DAO.getInstance().createUser(username, '1234', 'ok', 'Citizen', false);
        const request1 = (await request(Server.instance.app).post('/request').send({ username: username, content: "help", severity: "Dog" }));
        const response = (await request(Server.instance.app).delete('/request/'+request1.body.id));
        expect(response.status).toBe(201);
        try{
            let req = await DAO.getInstance().getRequestById(response.body.id);
        } catch (e){
            expect(e.message).toBe('Request not found');
        }
        
    })
    
    test("/get request, returns all requests that have been created", async () => {
        const username = 'testuser';
        await DAO.getInstance().createUser(username, '1234', 'ok', 'Citizen', false);
        const request1 = (await request(Server.instance.app).post('/request').send({ username: username, content: "help", severity: "Dog" }));
        const request2 = (await request(Server.instance.app).post('/request').send({ username: username, content: "help", severity: "Dog" }));
        
        const response = (await request(Server.instance.app).get('/request?status=UNRESOLVED'));
        expect(response.body[0].id).toBe(request1.body.id);
        expect(response.body[1].id).toBe(request2.body.id);
    })
})


describe("Counsel Group API", () => {
    
    test('Retrieve specialists by group', async () => {
        const data = {
            username: 'agron',
            password: '1234',
            specialists: 'Anxiety'
        }
        await request(Server.instance.app).post("/users").send(data);
        const response = await request(Server.instance.app).get(`/specialists/${data.specialists}`);
        expect(response.statusCode).toBe(200);
        expect(response.body.specialists[0]).toBe('agron');
    });

    test('Posting messages to a group ', async () => {
        let username1 = 'agron';
        const user1 = await DAO.getInstance().createUser(username1, '1234', 'ok', 'Citizen', false);
        const data = {
            username: 'agron',
            content: 'hello',
            timestamp: '100',
            status: 'ok',
            receiver: 'Anxiety',
            userid: user1._id.toString(),
        }
        await request(Server.instance.app).post(`/chatrooms/${data.receiver}`).send(data);
        const response = await request(Server.instance.app).get(`/chatrooms/${data.receiver}`);
        expect(response.statusCode).toBe(200);
        expect(response.body.archive[0].content).toBe(data.content);
    });

    test('Retrieve group messages', async () => {
        let username1 = 'agron';
        const user1 = await DAO.getInstance().createUser(username1, '1234', 'ok', 'Citizen', false);
        const data = {
            username: 'agron',
            content: 'get group messages',
            timestamp: '100',
            status: 'ok',
            receiver: 'Anxiety',
            userid: user1._id.toString(),
        }
        await request(Server.instance.app).post(`/chatrooms/${data.receiver}`).send(data);
        const response = await request(Server.instance.app).get(`/chatrooms/${data.receiver}`);
        expect(response.statusCode).toBe(200);
        expect(response.body.archive[0].content).toBe(data.content);
    });
    test('Verify group confirmation checks', async () => {
        const data = {
            username: 'agron',
            password: '1234',
            specialists: 'Anxiety'
        }
        await request(Server.instance.app).post("/users").send(data);
        const response = await request(Server.instance.app).get(`/chatrooms/${data.receiver}/${data.username}`);
        expect(response.body.message).toBe('No consent');
    });

    test('Handle group confirmation posts', async () => {
        const data = {
            username: 'agron',
            password: '1234',
            specialists: 'Anxiety'
        }
        await request(Server.instance.app).post("/users").send(data);
        await request(Server.instance.app).post(`/chatrooms/${data.receiver}/${data.username}`);
        const Check_confirm = await request(Server.instance.app).get(`/chatrooms/${data.receiver}/${data.username}`);

        expect(Check_confirm.body.message).toBe('Confirm given');
    });

    test('Edit a group message', async () => {
        let username1 = 'agron';
        const user1 = await DAO.getInstance().createUser(username1, '1234', 'ok', 'Citizen', false);
        const data = {
            username: 'agron',
            content: 'hello',
            timestamp: '100',
            status: 'ok',
            receiver: 'Anxiety',
            userid: user1._id.toString(),
        }
        let edited_ctx = 'edited';
        await request(Server.instance.app).post(`/chatrooms/${data.receiver}`).send(data);
        const message = await request(Server.instance.app).get(`/chatrooms/${data.receiver}`);
        const messageId = message.body.archive[0]._id;
        await request(Server.instance.app)
            .put(`/chatrooms/${data.receiver}/${messageId}`)
            .send({ content: edited_ctx })
            .expect(200)
            .expect((res) => {
                expect(res.body.message.content).toBe(edited_ctx);
            });
        jest.spyOn(DAO.getInstance(), 'updateMessageById').mockImplementation(() => { throw new Error() });
        await request(Server.instance.app)
            .put(`/chatrooms/${data.receiver}/${messageId}`)
            .send({ content: edited_ctx })
            .expect(400)
            .expect((res) => {
                
                expect(res.body.error).toBe('Update error');
            });


    });

    test('Delete a group message', async () => {
        let username1 = 'agron';
        const user1 = await DAO.getInstance().createUser(username1, '1234', 'ok', 'Citizen', false);
        const data = {
            username: 'agron',
            content: 'hello',
            timestamp: '100',
            status: 'ok',
            receiver: 'Anxiety',
            userid: user1._id.toString(),
        }
        await request(Server.instance.app).post(`/chatrooms/${data.receiver}`).send(data);
        const message = await request(Server.instance.app).get(`/chatrooms/${data.receiver}`);
        const messageId = message.body.archive[0]._id;
        const response = await request(Server.instance.app).delete(`/chatrooms/${data.receiver}/${messageId}`);
        expect(response.statusCode).toBe(200);
        
        // expect(response.body.message).toBe('Message deleted');
        const del_message = await request(Server.instance.app).get(`/chatrooms/${data.receiver}`);
        
    });
});
