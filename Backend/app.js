const express = require("express");
const path = require("path");
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
const collections = require("./dbconfig")

// Mongoose, for mongoDB interactions.
app.post("/register", async (req, res)=>{
  const data = {
    username:req.body.username,
    pasword:req.body.pasword
  }
  const userExists = await collections.findOne({username: data.username})
  if(userExists){
    res.send("User already exists, try different username")
  }
  console.log("here")
  const userdata = await collections.insertMany(data)
  console.log(userdata)
})

// SocketIO
app.get("/register", (req, res)=>{
  res.render("index")
})
app.use(router)
app.listen(port, function () {
  console.log(`Listening port... ${port}`);
});




