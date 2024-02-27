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
import { DAO } from './Backend/model/dao.js';
import cors from 'cors'

configDotenv();



const app = express();
const httpServer = createServer(app);
const port = 3000;

// Serving static files in view
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
app.use(express.static(path.join(__dirname, 'Frontend', 'views')));

app.use(cors())


// Setting up view engine
app.set('views', path.join(__dirname, 'Frontend', 'views'));
app.set("view engine", "ejs")

// Body-Parser
import body_parser from 'body-parser';
app.use(body_parser.urlencoded({ extended: false }));
app.use(express.json())
app.use(express.urlencoded({ extended: true }));

//passportjs-auth
const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
}
passport.use(new Strategy(options, (jwt_payload, done)=>{
  console.log('Authenticate invoked');
}))
app.use(passport.initialize());


// MongoDB connection
const main_uri ="mongodb+srv://daniilturpitka:Letoosen228@cluster0.1fayqt0.mongodb.net/?retryWrites=true&w=majority";
DAO.setDB(main_uri);


// Socket io connection

const io = setupSocket(httpServer);

app.use(router)
app.get('/just', (req, res)=>{
  io.emit('details');
  res.send({})
})
httpServer.listen(port, function () {
  console.log(`Listening port... ${port}`);
  
});