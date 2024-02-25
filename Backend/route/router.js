import express from 'express';
import { HomeView, indexView, UserConfirmation, UserJoin, UserAcknowledgement } from '../controller/joinCommunity.js';
import { loginOrLogout, registerUserSocket, getUsers } from '../controller/loginController.js';
import { ChatroomView, receiveMessage, getMessages} from '../controller/chatPublicly.js';
const router = express.Router();

router.get("/", HomeView);
router.get("/community", indexView);
router.get("/chatroom", ChatroomView);

router.get("/users", getUsers);
router.post("/users/verification", UserJoin);
router.post("/users/", UserConfirmation);
router.post("/users/acknowledgement", UserAcknowledgement);

router.patch("/auth/users", loginOrLogout); 
router.post("/sockets/users/:username", registerUserSocket );

router.post("/messages", receiveMessage);
router.get("/messagearchive", getMessages);




export default router;