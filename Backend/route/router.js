import express from 'express';
import { HomeView, indexView, UserConfirmation, UserJoin, UserAcknowledgement } from '../controller/joinCommunity.js';
import { loginOrLogout, registerUserSocket, getUsers } from '../controller/loginController.js';
import { ChatroomView, receivePublicMessage, loadPublicMessages } from '../controller/chatPublicly.js';
import { receivePrivateMessage, loadUnreadMessages } from '../controller/chatPrivately.js';
import { updateUserStatus, getStatus } from '../controller/shareStatus.js';
import { loadPrivateMessages } from '../controller/chatPrivately.js';
import  { searchByPublicMessage, searchByPrivateMessages, searchByAnnouncement, searchByStatus, searchByUsername } from '../controller/search_info.js';
import { startSpeedTest, stopSpeedTest, isSpeedTestOngoing } from '../controller/speedtest.js';
import {loadAnnouncementMessages, receiveAnnouncementMessage} from '../controller/postAnnouncement.js'
const router = express.Router();

router.get("/", HomeView);
router.get("/community", indexView);
router.get("/chatroom", ChatroomView);
router.get('/test', (req, res) => (res.send("Hello World")));
router.get("/users", getUsers);
router.post("/messages/public", receivePublicMessage);
router.get("/messages/public", loadPublicMessages);
router.post("/messages/private", receivePrivateMessage);
router.get("/messages/private", loadPrivateMessages);
router.get("/messages/private/unread", loadUnreadMessages);
router.get("/messages/announcement", loadAnnouncementMessages);
router.post("/messages/announcement", receiveAnnouncementMessage);

router.post("/users/verification", UserJoin);
router.post("/users/", UserConfirmation);
router.post("/users/acknowledgement", UserAcknowledgement);
router.put("/user/status/:username", updateUserStatus);
router.get("/user/status/:username", getStatus);

router.patch("/auth/users", loginOrLogout);
router.post("/sockets/users/:username", registerUserSocket);

router.get("/messages/public/search", searchByPublicMessage);
router.get("/messages/private/search", searchByPrivateMessages);
router.get("/messages/announcement/search", searchByAnnouncement);
router.get("/users/username/search", searchByUsername);
router.get("/users/status/search", searchByStatus);




router.get("/speedtest", isSpeedTestOngoing);
router.post("/speedtest", startSpeedTest);
router.post("/speedtest/end", stopSpeedTest);

export default router;