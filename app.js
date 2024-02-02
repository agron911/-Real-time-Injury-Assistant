const express = require("express");
const app = express();
const port = 3000;

// Managing user sessions;


//assume static files is in view
app.use(express.static('view'));


// Body-Parser
const body_parser = require("body-parser");
app.use(body_parser.urlencoded({ extended: false }));
const router = require("./route/index.js")

// Mongoose, for mongoDB interactions.


// SocketIO

app.use(router)
app.listen(port, function () {
  console.log(`Listening port... ${port}`);
});



