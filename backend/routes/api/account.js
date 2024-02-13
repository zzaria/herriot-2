const rooty=require('rooty');
rooty();
const constants= require('^constants');
const express = require('express');
const app = express();
const router = express.Router();
const bodyParser = require("body-parser")
const bcrypt = require("bcrypt");
const User = require('^models/User');
const Tag = require('^models/Tag');
const sanitizeHtml = require('sanitize-html');
const jwt = require("jsonwebtoken");

app.use(bodyParser.urlencoded({ extended: false }));

router.post("/login", async (req, res, next) => {

    let login = req.query;

    if(!login.username || !login.password) {
        return res.status(200).json({message:"Make sure each field has a valid value."});
    }

    var user = await User.findOne({username: login.username })
    .catch((error) => {
        console.log(error);
        return res.status(200).json({message:"Something went wrong."});
    });
    
    if(user && await bcrypt.compare(login.password, user.password)) {
        const token=jwt.sign(
            {userId: user._id },
            constants.SECRET, 
            { expiresIn: 16777216 }
        );
        return res.status(200).json({message:"Success",token:token});
    }

    return res.status(200).json({message:"Login credentials incorrect."});
});
router.get("/login", async (req, res, next) => {
    return res.status(200).send(req.curUserData);
});

module.exports = router;