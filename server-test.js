import express from 'express';
import { createServer } from "http";
import passport from 'passport';
import { Strategy } from 'passport-jwt';
import { ExtractJwt } from 'passport-jwt';
import { configDotenv } from 'dotenv';
import { setupSocket } from './Backend/utils/socketSetup.js';
import router from './Backend/route/router.js';

configDotenv();

const app = express();
const httpServer = createServer(app);
const port = 3000;

app.set("view engine", "ejs")
app.use(express.static('public'));

app.use(express.json())
app.use(express.urlencoded({ extended: true }));

//passportjs-auth
const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
}
passport.use(new Strategy(options, (jwt_payload, done) => {
  console.log('Authenticate invoked');
}))
app.use(passport.initialize());


const io = setupSocket(httpServer);

app.use(router)

httpServer.listen(port, function () {
  console.log(`Listening port... ${port}`);
});

export default httpServer;







