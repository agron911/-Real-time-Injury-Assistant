import express from 'express';
import { HomeView, indexView, UserConfirmation, UserJoin, UserAcknowledgement } from '../controller/joinCommunity.js';
import { loginOrLogout, registerUserSocket, getUsers } from '../controller/loginController.js';
import { ChatroomView, receivePublicMessage, loadPublicMessages } from '../controller/chatPublicly.js';
import { receivePrivateMessage, loadUnreadMessages } from '../controller/chatPrivately.js';
import { updateUserStatus, getStatus } from '../controller/shareStatus.js';
import { loadPrivateMessages } from '../controller/chatPrivately.js';
const router = express.Router();

router.get("/", HomeView);
router.get("/community", indexView);
router.get("/chatroom", ChatroomView);

router.get("/users", getUsers);
router.post("/messages/public", receivePublicMessage);
router.get("/messages/public", loadPublicMessages);
router.post("/messages/private", receivePrivateMessage);
router.get("/messages/private", loadPrivateMessages);
router.get("/messages/private/:username", loadUnreadMessages);

router.post("/users/verification", UserJoin);
router.post("/users/", UserConfirmation);
router.post("/users/acknowledgement", UserAcknowledgement);
router.put("/user/status/:username", updateUserStatus);
router.get("/user/status/:username", getStatus);

router.patch("/auth/users", loginOrLogout);
router.post("/sockets/users/:username", registerUserSocket);



export default router;