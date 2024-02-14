import express from 'express';
import collections from '../model/User.js';
import { isValid, getUserByName, createUser } from '../model/User.js'
import { appendFile } from 'fs';
import { hashPassword, comparePassword } from "../utils/passwordUtils.js";
import { HomeView, indexView, UserConfirmation, UserJoin, UserAcknowledgement} from '../controller/joinCommunity.js';
const router = express.Router();

router.get("/", HomeView);
router.get("/community", indexView);
router.post("/users/confirmation", UserConfirmation);
router.post("/users", UserJoin);
router.post("/users/acknowledgement", UserAcknowledgement);

export default router;