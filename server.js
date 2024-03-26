import express from 'express';
import path from 'path';
import { createServer } from "http";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import passport from 'passport';
import { Strategy } from 'passport-jwt';
import { ExtractJwt } from 'passport-jwt';
import { setupSocket } from './Backend/utils/socketSetup.js';
import router from './Backend/route/router.js';
import DAO from './Backend/model/dao.js';
import body_parser from 'body-parser';
import cors from 'cors'

class Server {

  static instance;

  constructor() {

    if(Server.instance!=null){
      throw new TypeError("Attempted to create a second instance");
    }

    this.allowAllRoutes = true;

    this.app = express();
    const httpServer = createServer(this.app);
    const port = 3000;
    
    this.app.use(cors());
    // Setting up view engine
    this.app.set("view engine", "ejs");
    this.app.use(express.static('public'));

    // Body-Parser
    this.app.use(body_parser.urlencoded({ extended: false }));
    this.app.use(express.json())
    this.app.use(express.urlencoded({ extended: true }));

    //passportjs-auth
    const options = {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
    }
    passport.use(new Strategy(options, (jwt_payload, done) => {
      console.log('Authenticate invoked');
    }))
    this.app.use(passport.initialize());

    const environment = process.env.NODE_ENV;

    
  
    // Socket io connection
    const io = setupSocket(httpServer);
    this.app.use(router);
    httpServer.listen(port, function () {
      console.log(`Listening port... ${port}`);
    });

  }
  
  static createAndRun(){
    Server.instance = new Server();
    return Server.instance;
  }

  static disableRoutes(socketID){
    Server.instance.testSocketID = socketID;
  }

  static enableRoutes(){
    Server.instance.testSocketID = null;
  }

  static get(){
    return Server.instance;
  }

}

export default Server;







