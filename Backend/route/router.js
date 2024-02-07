import express from 'express';
import path from 'path';
import collections from '../model/User.js';
import mongoose from 'mongoose';
import { appendFile } from 'fs';
import {hashPassword, comparePassword } from "../utils/passwordUtils.js";
const router = express.Router();

router.get("/", (req, res) => {
    //console.log('here')
    res.render("index")
})


router.post("/registerconfirm", async (req, res) => {

    let un = req.body.username;
    const data = {
        username: un.toLowerCase(),
        password: req.body.password
    }
    const hashed_password = await hashPassword(data.password);
    const userdata = await collections.insertMany({ username: data.username, password: hashed_password })
    res.status(202).send()

})

router.post("/register", async (req, res) => {
    let un = req.body.username;
    console.log('lfoka', req.body.username);
    const data = {
        username: un.toLowerCase(),
        password: req.body.password
    }
    console.log(data)
    const userExists = await collections.findOne({ username: data.username })
    var status = 0;
    console.log(userExists)
    if (userExists) {
        status = 401
        console.log('401')
    }
    else {
        status = 201;
        console.log('success', data)
    }
    res.status(status).send()

})

export default router;