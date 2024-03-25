import { connect, closeDatabase, clearDatabase } from './db-handler';
import httpServer from '../../server-test.js'
import request from 'supertest';
import DAO from '../model/dao.js';
import { hashPassword, comparePassword } from "../utils/passwordUtils.js";


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
    await closeDatabase();
    await new Promise((resolve, reject) => {
        httpServer.close((err) => {
            if (err) {
                reject(err);
                return;
            }
            resolve();
        });
    });
});


describe('Testing Share Status API', () => {

    test("/Get user status", async () => {
        await DAO.getInstance().createUser('agron', await hashPassword('1234'), 'ok')
        const response = await request(httpServer).get("/user/status/agron");
        expect(response.statusCode).toBe(200);
        expect(response.body.status).toBe('ok');
    });


    test('/Update user status', async () => {
        await DAO.getInstance().createUser('agron1', await hashPassword('1234'), 'ok')
        const response = (await request(httpServer).put('/user/status/agron1').send({ status: 'help' }));
        const user_status = await DAO.getInstance().getUserByName('agron1');
        expect(response.statusCode).toBe(200);
        expect(user_status.status).toBe('help');
    })


})


describe('Testing Chat pribately API', () => {

    test("/Get all latest private messages", async () => {
        // username, content, timestamp, status, receiver, viewe
        let user1 = 'agron';
        let user2 = 'Taige';
        await DAO.getInstance().createMessage(user1, "a send to T", "100", 'ok', user2, true)
        await DAO.getInstance().createMessage(user2, "T send to a", "100", 'ok', user1, true)
        const response = (await request(httpServer).get("/messages/private?username1=" + user1 + "&username2=" + user2));
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
        const response = (await request(httpServer).get('/messages/private/' + user2));
        expect(response.statusCode).toBe(200);
        expect(response.body.archive[0].content).toBe('a send to T');
        expect(response.body.archive[1].content).toBe('k send to T');
    })

    test('/Post msg', async () => {
        let user1 = 'agron';
        let user2 = 'Taige';
        const body = { username: user1, content: "a send to T", timestamp: "100", status: 'help', receiver: user2 }
        const response = ((await request(httpServer).post('/messages/private/').send(body)));
        const user2_msg = await DAO.getInstance().getUnreadMessages(user2);
        console.log("????????????????", user2_msg);
        expect(response.statusCode).toBe(200);
        expect(user2_msg[0].content).toBe('a send to T');
    })

})