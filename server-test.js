import express from 'express';
import path from 'path';
import { createServer } from "http";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import passport from 'passport';
import { Strategy } from 'passport-jwt';
import { ExtractJwt } from 'passport-jwt';
import { configDotenv } from 'dotenv';
import { setupSocket } from './Backend/utils/socketSetup.js';
import router from './Backend/route/router.js';
import DAO from './Backend/model/dao.js';

import cors from 'cors'

configDotenv();

const app = express();
const httpServer = createServer(app);
const port = 3000;

// Serving static files in view
// const __filename = fileURLToPath(new URL(import.meta.url));
// const __dirname = dirname(__filename);
// app.use(express.static(path.join(__dirname, 'Frontend', 'views')));

// app.use(cors())


// Setting up view engine

// app.set('views', path.join(__dirname, 'Frontend', 'views'));
app.set("view engine", "ejs")
app.use(express.static('public'));

// Body-Parser
import body_parser from 'body-parser';
app.use(body_parser.urlencoded({ extended: false }));
app.use(express.json())
app.use(express.urlencoded({ extended: true }));

//passportjs-auth
const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET?process.env.JWT_SECRET:"test_secret",
}
passport.use(new Strategy(options, (jwt_payload, done) => {
  
}))
app.use(passport.initialize());


app.use(router)
httpServer.listen(port, function () {
  
});

export default httpServer;







