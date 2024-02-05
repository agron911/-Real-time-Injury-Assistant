const express = require("express");
const path = require("path");
const collections = require("./dbconfig")
const app = express();
const port = 3000;

// Managing user sessions;


//assume static files is in view
app.use(express.static(path.join(__dirname,'..','Frontend/views')));
app.use(express.json())
app.set("view engine", "ejs")

app.set('views', path.join(__dirname,'..', '/Frontend/views'));


// Body-Parser
const body_parser = require("body-parser");
app.use(body_parser.urlencoded({ extended: false }));
const router = require("./route/index.js");
const collection = require("./route/index.js");
//console.log('test require')

// Mongoose, for mongoDB interactions.
app.post("/register", async (req, res)=>{
  let un = req.body.username;
  const data = {
    username:un.toLowerCase(),
    passsword:req.body.passsword
  }
  console.log(data)
  const userExists = await collections.findOne({username: data.username})
  var status = 0;
  console.log(userExists)
  if(userExists){
    status = 401
    console.log('401')
  }
  else{
    const userdata = await collections.insertMany(data)
    status = 201
    console.log('success')
  }
  res.status(status).send()
  
  console.log(`test`);
  
  //res.status(201).json({something: "something"})
  
})

// SocketIO
app.get("/", (req, res)=>{
  //console.log('here')
  res.render("index")
})
app.use(router)
app.listen(port, function () {
  console.log(`Listening port... ${port}`);
});




