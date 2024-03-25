import { connect, closeDatabase, clearDatabase } from './db-handler';
import httpServer from '../../server-test.js'
import request from 'supertest';
import DAO from '../model/dao.js';
import { hashPassword, comparePassword } from "../utils/passwordUtils.js";
import { expect, jest, test } from '@jest/globals';


/**
 * Connect to a new in-memory database before running any tests.
 */
beforeAll(async () => {
    await connect();
});

/**
 * Clear all test data after every test.
 */
afterEach(async () => await clearDatabase());

/**
 * Remove and close the db and server.
 */
afterAll(async () => {
    jest.restoreAllMocks();
    await closeDatabase();
    await new Promise((resolve, reject) => {
        httpServer.close((err) => {
            if (err) {
                console.error("Error closing the server:", err);

                reject(err);
                return;
            }
            console.log("Server closed!");
            resolve();
        });
    }).catch((err) => console.error("err in closing promis", err));
});


// router.get("/community", indexView);
// router.post("/users/", UserConfirmation);
// router.post("/users/verification", UserJoin);
// router.post("/users/acknowledgement", UserAcknowledgement);
describe("Test Join Community API", () => {
    test("/Get community", async () => {
        const response = await request(httpServer).get("/community");
        expect(response.statusCode).toBe(200);
    });

    test("/Post users resigtration", async () => {
        const data = {
            username: 'agron',
            password: '1234'
        }
        const response = await request(httpServer).post("/users/").send(data);
        expect(response.statusCode).toBe(202);
        expect(response.body.data.username).toBe('agron');
        const response2 = await request(httpServer).post("/users/").send(data);
        expect(response2.statusCode).toBe(400);
        expect(response2.body.message).toBe('User already exists!');
    })

    test("/Post users verification-username/passoword", async () => {
        const data = {
            username: 'ag',
            password: '1234'
        }
        const response = await request(httpServer).post("/users/verification").send(data);
        expect(response.statusCode).toBe(401);
        expect(response.body.message).toBe('Username length invalid');
        const data2 = {
            username: 'agron',
            password: '123'
        }
        const response2 = await request(httpServer).post("/users/verification").send(data2);
        expect(response2.statusCode).toBe(402);
        expect(response2.body.message).toBe('Password length invalid');
        const data3 = {
            username: 'all',
            password: '1234'
        }
        const response3 = await request(httpServer).post("/users/verification").send(data3);
        expect(response3.statusCode).toBe(403);
        expect(response3.body.message).toBe('Username prohibited');
        const data4 = {
            username: 'agron3',
            password: '1234'
        }
        const response4 = await request(httpServer).post("/users/verification").send(data4);
        expect(response4.statusCode).toBe(201);
        expect(response4.body.message).toBe('User does not exist');

        await request(httpServer).post("/users").send(data4);
        const response6 = await request(httpServer).post("/users/verification").send(data4);

        expect(response6.statusCode).toBe(202);
        expect(response6.body.message).toBe('Join successful');
        const data7 = {
            username: 'agron3',
            password: '12345'
        }
        const response7 = await request(httpServer).post("/users/verification").send(data7);
        expect(response7.statusCode).toBe(400);
        expect(response7.body.message).toBe('Password mismatch');
    })

    test("/Post users acknowledgement", async () => {
        const data = {
            username: 'agron',
            password: '1234'
        }
        await request(httpServer).post("/users").send(data);
        const response = await request(httpServer).post("/users/acknowledgement").send({ username: 'agron' });
        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe('Acknowledged');

        const response2 = await request(httpServer).post("/users/acknowledgement").send({ username: 'agron1' });
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
        await request(httpServer).post("/users").send(data);
        const response = await request(httpServer).get("/users");
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
        const response = await request(httpServer).post("/messages/public").send(data);
        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe('message received');

        // TODO: test error, it works sometimes
        
        // jest.spyOn(DAO.getInstance(), 'createMessage').mockImplementation(() => { throw new Error('Create Message database failure') });
        // const response2 = await request(httpServer).post("/messages/public").send(data);
        // expect(response2.statusCode).toBe(400);
        // expect(response2.body.error).toBe('Create Message database failure');

    })
    test('/Get all public messages', async () => {
        const data = {
            username: 'agron',
            content: 'hello',
            timestamp: '100',
            status: 'ok',
            receiver: 'all'
        }
        await request(httpServer).post("/messages/public").send(data);
        const response = await request(httpServer).get("/messages/public");
        let msg = response.body.archive.filter(msg => msg.username === data.username && msg.timestamp === data.timestamp)
        expect(response.statusCode).toBe(200);
        expect(msg[0].content).toBe('hello');
    })
})


describe('Test Share Status API', () => {

    test("/Get user status", async () => {
        const data = {
            username: 'agron',
            password: '1234'
        }
        await request(httpServer).post("/users").send(data);
        const response = await request(httpServer).get("/user/status/" + data.username);
        expect(response.statusCode).toBe(200);
        expect(response.body.status).toBe('undefined');
    });


    test('/Update user status', async () => {
        const data = {
            username: 'agron1',
            password: '1234'
        }
        await request(httpServer).post("/users").send(data);
        const response = await request(httpServer).put('/user/status/' + data.username).send({ status: 'help' });
        const user_status = await DAO.getInstance().getUserByName(data.username);
        expect(response.statusCode).toBe(200);
        expect(user_status.status).toBe('help');
    })

})

describe('Test Chat privately API', () => {

    test("/Get all latest private messages", async () => {
        // username, content, timestamp, status, receiver, viewe
        let user1 = 'agron';
        let user2 = 'Taige';
        await DAO.getInstance().createMessage(user1, "a send to T", "100", 'ok', user2, true)
        await DAO.getInstance().createMessage(user2, "T send to a", "100", 'ok', user1, true)
        const response = await request(httpServer).get("/messages/private?username1=" + user1 + "&username2=" + user2);
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
        const response = await request(httpServer).get('/messages/private/' + user2);
        expect(response.statusCode).toBe(200);
        expect(response.body.archive[0].content).toBe('a send to T');
        expect(response.body.archive[1].content).toBe('k send to T');
    })

    test('/Post msg', async () => {
        let user1 = 'agron';
        let user2 = 'Taige';
        const body = { username: user1, content: "a send to T", timestamp: "100", status: 'help', receiver: user2 }
        const response = await request(httpServer).post('/messages/private/').send(body);
        const user2_msg = await DAO.getInstance().getUnreadMessages(user2);
        expect(response.statusCode).toBe(200);
        expect(user2_msg[0].content).toBe('a send to T');
    })

})