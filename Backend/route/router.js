import express from 'express';
import { HomeView, indexView, UserConfirmation, UserJoin, UserAcknowledgement} from '../controller/joinCommunity.js';
import { newMessage } from '../controller/addMessage.js'
const router = express.Router();

router.get("/", HomeView);
router.get("/community", indexView);
router.post("/users/confirmation", UserConfirmation);
router.post("/users", UserJoin);
router.post("/users/acknowledgement", UserAcknowledgement);
router.post("/messageboard/newmessage", newMessage)

export default router;