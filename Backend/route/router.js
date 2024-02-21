import express from 'express';
import { HomeView, indexView, UserConfirmation, UserJoin, UserAcknowledgement } from '../controller/joinCommunity.js';
import { loginOrLogout, registerUserSocket, getUsers } from '../controller/loginController.js';
import { ChatroomView, receiveMessage } from '../controller/chatPublicly.js';
import { loadMessages } from '../model/Message.js'
const router = express.Router();

router.get("/", HomeView);
router.get("/community", indexView);
router.get("/chatroom", ChatroomView);

router.get("/users", getUsers);
router.post("/users", UserJoin);
router.post("/users/confirmation", UserConfirmation);
router.post("/users/acknowledgement", UserAcknowledgement);

router.patch("/auth/users", loginOrLogout); 
router.post("/sockets/users/:username", registerUserSocket );

router.post("/messages", receiveMessage);




export default router;