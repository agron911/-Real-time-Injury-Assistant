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
router.get("/messages", loadMessages);
router.post("/messages", receiveMessage);

router.post("/users/verification", UserJoin);
router.post("/users/", UserConfirmation);
router.post("/users/acknowledgement", UserAcknowledgement);

router.patch("/auth/users", loginOrLogout); 
router.post("/sockets/users/:username", registerUserSocket );





export default router;