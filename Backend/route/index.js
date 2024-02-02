const express = require('express')
const router = express.Router()
const path = require('path')
// const passport = require('passport');

// assuming html files stored in view
const viewDirectory = path.join(__dirname, '..', 'view');

router.get("/main", function (req, res) {
    // assuming there's a main html
    // res.sendFile(path.join(viewDirectory,'main.html'));
});

router.post("/register", function (req, res) {
    let name = req.body.username;
    let password = req.body.password;
    
});

// login authentication using local strategy
// router.post("/login", passport.authenticate('local', {
//     successRedirect: "/chatroom",
//     failureRedirect: "/main?error=WrongPassword"
// }));


module.exports = router;