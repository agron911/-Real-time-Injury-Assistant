import express from 'express';
import collections from '../model/User.js';
import { isValid } from '../model/user_handler.js'
import { appendFile } from 'fs';
import { hashPassword, comparePassword } from "../utils/passwordUtils.js";
const router = express.Router();


router.get("/", (req, res) => {
    res.render("home")
})

router.get("/community", (req, res) => {
    res.render("index")
})

router.post("/users/confirmation", async (req, res) => {

    let un = req.body.username;
    const data = {
        username: un.toLowerCase(),
        password: req.body.password
    }
    const hashed_password = await hashPassword(data.password);
    const userdata = await collections.insertMany({ username: data.username, password: hashed_password })
    res.status(202).send({ data })

})

router.post("/users", async (req, res) => {
    // Store frontend data
    const data = {
        username: req.body.username.toLowerCase(),
        password: req.body.password
    }

    var status = 0;

    // Check username password rules
    var ruleCheck = isValid(data.username, data.password);
    if (ruleCheck) {
        res.status(400 + ruleCheck).send();
        return;
    }

    // Check existing user
    const userExists = await collections.findOne({ username: data.username })

    if (userExists) {
        const hashed_password = await hashPassword(data.password);
        const isPasswordCorrect = await comparePassword(userExists.password, data.password, hashed_password);
        console.log('is password correct', isPasswordCorrect)
        if (isPasswordCorrect) {
            status = 205;
        } else {
            status = 400;
        }
    }
    else {
        status = 201;
        console.log('success', data);
    }
    res.status(status).send();

})

router.post("/users/acknowledge", async (req, res) => {
    const username = req.body.username;
    console.log('khkdofkg', username, req.body)
    const userExists = await collections.findOne({ username: username })
    console.log('userExists', userExists)
    if (userExists) {
        try {
            await collections.findOneAndUpdate({ username: username }, {
                acknowledged: true,
            });
            res.status(200).send('Acknowledged');
        } catch (err) {
            res.status(500).send('Something went wrong!');
        }
    } else {
        res.status(404).send("User does not exist");
    }
})

export default router;