import express from 'express';
import { HomeView, indexView, UserConfirmation, UserJoin, UserAcknowledgement} from '../controller/joinCommunity.js';
import { loginOrLogout, registerUserSocket } from '../controller/loginController.js';
const router = express.Router();

router.get("/", HomeView);
router.get("/community", indexView);
router.post("/users/confirmation", UserConfirmation);
router.post("/users", UserJoin);
router.patch("/auth/users", loginOrLogout); 
router.post("/users/acknowledgement", UserAcknowledgement);
router.post("/socket/users/:username", registerUserSocket );

export default router;