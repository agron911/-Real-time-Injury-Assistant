import express from 'express';
import { HomeView, indexView, UserConfirmation, UserJoin, UserAcknowledgement } from '../controller/joinCommunity.js';
import { loginOrLogout, registerUserSocket, getUsers, getUser } from '../controller/loginController.js';
import { ChatroomView, receivePublicMessage, loadPublicMessages } from '../controller/chatPublicly.js';
import { receivePrivateMessage, loadUnreadMessages } from '../controller/chatPrivately.js';
import { updateUserStatus, getStatus } from '../controller/shareStatus.js';
import { loadPrivateMessages } from '../controller/chatPrivately.js';
import  { searchByPublicMessage, searchByPrivateMessages, searchByAnnouncement, searchByStatus, searchByUsername } from '../controller/search_info.js';
import { startSpeedTest, stopSpeedTest, isSpeedTestOngoing } from '../controller/speedtest.js';
import {loadAnnouncementMessages, receiveAnnouncementMessage} from '../controller/postAnnouncement.js'
import { EmergencyServicesView, registerAsEsp } from '../controller/espController.js';
import { createRequest, getRequests, updateRequest, deleteRequest, getRequest } from '../controller/requestController.js';
import { firstaidView, loadInjuryByUsernames, receiveInjury, createChatMsg} from '../controller/seekFirstAid.js';
import { createNotification, getNotificationByUsername, handleGetStockSupply, newWaitlist, getWaitlistRole, waitlistCitizenView, waitlistElectView, waitlistProviderView, setWaitlistRole, getWaitlist, joinWaitlist, leaveWaitlist, getWaitlistDetails, handleSupplyWaitlist, deleteNotification} from '../controller/manageWaitlists.js';
import { loadGroupMessages, receiveGroupMessage, CheckConfirmation, ConfirmGroup, getSpecialists, editGroupMessage, deleteGroupMessage} from '../controller/counselGroup.js';
import { Facilities, addFacility, getAllFacilities, getFacilityByName, searchFacility, deleteFacility, updateFacilityInfo } from '../controller/facilities.js';
import {changeUserInfo} from '../controller/adminProfileController.js'
const router = express.Router();

router.get("/", HomeView);
router.get("/community", indexView);
router.get("/chatroom", ChatroomView);
router.get("/emergencyServices", EmergencyServicesView)
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
router.post("/users", UserConfirmation);
router.post("/users/acknowledgement", UserAcknowledgement);
router.get("/user/:username", getUser); //TODO: fix this, should be users
router.put("/user/status/:username", updateUserStatus); // TODO: probably it should be users/:username/staus
router.get("/user/status/:username", getStatus); //TODO: fix this, should be users


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

router.put("/user/:username/esp", registerAsEsp);
router.get("/request/:id", getRequest);
router.get("/request", getRequests);
router.post("/request", createRequest);
router.put("/request/:id", updateRequest);
router.delete("/request/:id", deleteRequest);

router.get("/firstaid", firstaidView);
router.get("/injuries/:username", loadInjuryByUsernames);
router.post("/injuries/:username", receiveInjury);
router.get("/injuries/instructions/:username", createChatMsg);

router.get("/waitlists", waitlistElectView);
router.get("/waitlists/citizens", waitlistCitizenView);
router.get("/waitlists/providers", waitlistProviderView);
router.get("/waitlists/role/:username", getWaitlistRole);
router.post("/waitlists/role", setWaitlistRole);
router.get("/waitlists/citizens/:username", getWaitlist);
router.post("/waitlists/citizens", joinWaitlist);
router.post("/waitlists/citizens/stock", handleGetStockSupply);
router.delete("/waitlists/citizens/:username/:medname", leaveWaitlist);
router.get("/waitlists/providers/details/:medname", getWaitlistDetails);
router.post("/waitlists/providers", newWaitlist);
router.post("/waitlists/providers/supplies", handleSupplyWaitlist);
router.post("/waitlists/citizens/", handleSupplyWaitlist)

router.get("/waitlists/notifications/:username", getNotificationByUsername);
router.post("/waitlists/notifications", createNotification);
router.delete("/waitlists/notifications/:id", deleteNotification);

router.get("/specialists/:group", getSpecialists);
router.get("/chatrooms/:group", loadGroupMessages);
router.get("/chatrooms/:group/:username", CheckConfirmation);
router.post("/chatrooms/:group/:username", ConfirmGroup);
router.post("/chatrooms/:group", receiveGroupMessage);
router.put("/chatrooms/:group/:messageId", editGroupMessage);
router.delete("/chatrooms/:group/:messageId", deleteGroupMessage);

router.get("/facilities", Facilities)
router.get("/facilities/directory", getAllFacilities);
router.post("/facilities/newfacility", addFacility);
router.get("/facilities/:facilityname", getFacilityByName);
router.get("/facility/search", searchFacility)
router.delete("/facilities", deleteFacility)
router.patch("/facilities/newinfo", updateFacilityInfo)

// router.patch("/admin/info", changeUserInfo)
router.patch("/users/profile/:userid", changeUserInfo)
// router.patch("/admin/accountstatus", changeAccountStatus)
export default router;