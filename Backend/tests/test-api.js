import { connect, closeDatabase, clearDatabase } from './db-handler';
// import httpServer from '../../server-test.js'
import Server from '../../server.js';
import request from 'supertest';
import DAO from '../model/dao.js';
import { hashPassword, comparePassword } from "../utils/passwordUtils.js";


/**
 * Connect to a new in-memory database before running any tests.
 */
beforeAll(async () => {
    await connect();
    console.log("here");
    Server.createAndRun(true);
});

/**
 * Clear all test data after every test.
 */
afterEach(async () => await clearDatabase());

/**
 * Remove and close the db and server.
 */
afterAll(async () => {
    await new Promise((resolve, reject) => {
        Server.instance.httpServer.close((err) => {
            if (err) {
                reject(err);
                return;
            }
            resolve();
        });
    });
    await closeDatabase();
});


describe("Test Join Community API", () => {
    test("/Get community", async () => {
        const response = await request(Server.instance.httpServer).get("/community");
        expect(response.statusCode).toBe(200);
    });

    test("/Post users resigtration", async () => {
        const data = {
            username: 'agron',
            password: '1234'
        }
        const response = await request(Server.instance.httpServer).post("/users/").send(data);
        expect(response.statusCode).toBe(202);
        expect(response.body.data.username).toBe('agron');
        const response2 = await request(Server.instance.httpServer).post("/users/").send(data);
        expect(response2.statusCode).toBe(400);
        expect(response2.body.message).toBe('User already exists!');
    })

    test("/Post users verification-username/passoword", async () => {
        const data = {
            username: 'ag',
            password: '1234'
        }
        const response = await request(Server.instance.httpServer).post("/users/verification").send(data);
        expect(response.statusCode).toBe(401);
        expect(response.body.message).toBe('Username length invalid');
        const data2 = {
            username: 'agron',
            password: '123'
        }
        const response2 = await request(Server.instance.httpServer).post("/users/verification").send(data2);
        expect(response2.statusCode).toBe(402);
        expect(response2.body.message).toBe('Password length invalid');
        const data3 = {
            username: 'all',
            password: '1234'
        }
        const response3 = await request(Server.instance.httpServer).post("/users/verification").send(data3);
        expect(response3.statusCode).toBe(403);
        expect(response3.body.message).toBe('Username prohibited');
        const data4 = {
            username: 'agron3',
            password: '1234'
        }
        const response4 = await request(Server.instance.httpServer).post("/users/verification").send(data4);
        expect(response4.statusCode).toBe(201);
        console.log(response4.body);
        expect(response4.body.message).toBe('User does not exist');

        await request(Server.instance.httpServer).post("/users").send(data4);
        const response6 = await request(Server.instance.httpServer).post("/users/verification").send(data4);

        expect(response6.statusCode).toBe(206);
        expect(response6.body.message).toBe('Join successful');
        const data7 = {
            username: 'agron3',
            password: '12345'
        }
        const response7 = await request(Server.instance.httpServer).post("/users/verification").send(data7);
        expect(response7.statusCode).toBe(400);
        console.log(response7.body);
        expect(response7.body.message).toBe('Password mismatch');
    })

    test("/Post users acknowledgement", async () => {
        const data = {
            username: 'agron',
            password: '1234'
        }
        await request(Server.instance.httpServer).post("/users").send(data);
        const response = await request(Server.instance.httpServer).post("/users/acknowledgement").send({ username: 'agron' });
        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe('Acknowledged');

        const response2 = await request(Server.instance.httpServer).post("/users/acknowledgement").send({ username: 'agron1' });
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
        await request(Server.instance.httpServer).post("/users").send(data);
        const response = await request(Server.instance.httpServer).get("/users");
        expect(response.statusCode).toBe(200);
    })
})


describe('Test Chat Public API', () => {

    test('/Post public message', async () => {
        const data = {
            username: 'agron',
            content: 'hello',
            timestamp: '100',
            status: 'ok',
            receiver: 'all'
        }
        const response = await request(Server.instance.httpServer).post("/messages/public").send(data);
        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe('message received');


        const data2 = {
            username: 'agron',
            content: 'hello',
            timestamp: '100',
            status: 'ok',
        }
        const response2 = await request(Server.instance.httpServer).post("/messages/public").send(data2);
        expect(response2.statusCode).toBe(400);

    })
    test('/Get all public messages', async () => {
        const data = {
            username: 'agron',
            content: 'hello',
            timestamp: '100',
            status: 'ok',
            receiver: 'all'
        }
        await request(Server.instance.httpServer).post("/messages/public").send(data);
        const response = await request(Server.instance.httpServer).get("/messages/public");
        let msg = response.body.archive.filter(msg => msg.username === data.username && msg.timestamp === data.timestamp)
        expect(response.statusCode).toBe(200);
        expect(msg[0].content).toBe('hello');
    })
})


describe('Test Share Status API', () => {

    test("/Get user status", async () => {
        await DAO.getInstance().createUser('agron', await hashPassword('1234'), 'ok')
        const response = await request(Server.instance.httpServer).get("/user/status/agron");
        expect(response.statusCode).toBe(200);
        expect(response.body.status).toBe('ok');
    });


    test('/Update user status', async () => {
        await DAO.getInstance().createUser('agron1', await hashPassword('1234'), 'ok')
        const response = (await request(Server.instance.httpServer).put('/user/status/agron1').send({ status: 'help' }));
        const user_status = await DAO.getInstance().getUserByName('agron1');
        expect(response.statusCode).toBe(200);
        expect(user_status.status).toBe('help');
    })


})


describe('Testing Chat pribately API', () => {

    test("/Get all latest private messages", async () => {
        let user1 = 'agron';
        let user2 = 'Taige';
        await DAO.getInstance().createMessage(user1, "a send to T", "100", 'ok', user2, true)
        await DAO.getInstance().createMessage(user2, "T send to a", "100", 'ok', user1, true)
        const response = (await request(Server.instance.httpServer).get("/messages/private?username1=" + user1 + "&username2=" + user2));
        expect(response.statusCode).toBe(200);
        expect(response.body.archive[0].content).toContain('a send to T');
        expect(response.body.archive[1].content).toContain('T send to a');
    });


    test('/Get specific user unread msg', async () => {
        let user1 = 'agron';
        let user2 = 'Taige';
        let user3 = 'Kaushik';
        await DAO.getInstance().createMessage(user1, "a send to T", "100", 'ok', user2, false)
        await DAO.getInstance().createMessage(user3, "k send to T", "100", 'ok', user2, false)
        const response = (await request(Server.instance.httpServer).get('/messages/private/' + user2));
        expect(response.statusCode).toBe(200);
        expect(response.body.archive[0].content).toBe('a send to T');
        expect(response.body.archive[1].content).toBe('k send to T');
    })

    test('/Post msg', async () => {
        let user1 = 'agron';
        let user2 = 'Taige';
        const body = { username: user1, content: "a send to T", timestamp: "100", status: 'help', receiver: user2 }
        const response = ((await request(Server.instance.httpServer).post('/messages/private/').send(body)));
        const user2_msg = await DAO.getInstance().getUnreadMessages(user2);
        expect(response.statusCode).toBe(200);
        expect(user2_msg[0].content).toBe('a send to T');
    })

})