import express from 'express';
import { HomeView, indexView, UserConfirmation, UserJoin, UserAcknowledgement } from '../controller/joinCommunity.js';
import { ChatroomView } from '../controller/chatPublicly.js';
const router = express.Router();

router.get("/", HomeView);
router.get("/community", indexView);
router.post("/users/confirmation", UserConfirmation);
router.post("/users", UserJoin);
router.post("/users/acknowledgement", UserAcknowledgement);

// New route for iteration 1

router.get("/chatroom", ChatroomView);

// Provide username info to chatroom frontend
router.get('/users/info', async (req, res) => {
    console.log(`Init user`)
    const data = {
        username: 'Dummy',
    };
    res.status(200).send(data);
});

router.get('/messages/initialization', async (req, res) => {
    console.log(`Init previous messages`)
    // TODO: Socket.io emit archived messages to frontend through "initMessages"

    // console.log('Initialize chat room msg...');
    // const allMsg = await Message.find({});
    // if (!allMsg) {
    //   console.log(`No existing messages.`);
    // } else {
    //   socket.emit('initMessages', allMsg);
    // }

    res.status(200);
});


export default router;