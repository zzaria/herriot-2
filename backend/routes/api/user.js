const rooty = require('rooty');
const bcrypt = require('bcrypt');
const sanitizeHtml = require('sanitize-html');
const jwt = require("jsonwebtoken");
rooty();
const constants = require('^constants');
const express = require('express');
const app = express();
const router = express.Router();
const bodyParser = require("body-parser")
const User = require('^models/User');
const Tag = require('^models/Tag');
const { userAuth } = require('^middleware');
const { ObjectId } = require('mongodb');
const fetch = require('node-fetch');

app.use(bodyParser.urlencoded({ extended: false }));

router.post("/", async (req, res, next) => {
    let success = true, message = [];
    let { username, password } = req.query;
    const userId = ObjectId();
    let user = await createUser({ username, password });
    if (user.error) {
        return res.status(200).send(user);
    }
    user = {
        _id: userId,
        tags: [],
        ...user
    };
    await Tag.create({ name: "Solved", users: [{ user: userId }] }).then(tag => { user.tags.push({ tag: tag._id, color: 'rgba(48,80,80,0.8)' }); user.solved_tag = tag._id });
    await Tag.create({ name: "In Progress", users: [{ user: userId }] }).then(tag => user.tags.push({ tag: tag._id, color: 'rgba(255, 238, 186,0.2)' }));
    await Tag.create({ name: "To Do", users: [{ user: userId }] }).then(tag => user.tags.push({ tag: tag._id, color: '' }));
    await Tag.create({ name: "Skipped", users: [{ user: userId }] }).then(tag => user.tags.push({ tag: tag._id, color: 'rgba(184, 218, 255,0.5)' }));
    await Tag.create({ name: "Favourites", users: [{ user: userId }] }).then(tag => user.tags.push({ tag: tag._id, color: 'rgba(255, 105, 180,0.5)' }));


    User.create(user)
        .then(async (user) => {
            const token = jwt.sign(
                { userId: user._id },
                constants.SECRET,
                { expiresIn: "1w" }
            );
            return res.status(200).json({ token });
        });
});
router.get("/:id", async (req, res, next) => {
    let id = req.params.id;
    if (id == "cur") {
        if (!req.curUser) {
            return res.sendStatus(400);
        }
        id = req.curUser;
    }
    let user;
    try {
        if (req.curUser != id && req.perms < constants.ADMIN_PERM) {
            user = await User.findById(id).populate("tags.tag").select("username profilePic power experience solved description tags");
            if (!user) {
                return res.sendStatus(400);
            }
            user.tags = user.tags.filter(tag => tag.access == 0 && tag.tag.public);
        }
        else {
            user = await User.findById(id).populate("tags.tag");
            if (!user) {
                return res.sendStatus(400);
            }
        }
        if (user) {
            res.status(200).send(user);
        }
        else {
            res.sendStatus(400);
        }
    } catch (error) {

        res.sendStatus(400);
    }
});
router.put("/:id", async (req, res, next) => {
    let { password, newUser } = req.body;
    const oldUser = await User.findById(req.params.id);
    if (!oldUser) {
        return res.status(404);
    }
    if ((!password || !oldUser.password || !await bcrypt.compare(password, oldUser.password))
        && req.perms < constants.ADMIN_PERM) {
        return res.status(200).json({ error: "Incorrect Password" });
    }
    let newUser2 = await createUser(newUser, oldUser.username, oldUser.password);
    if (newUser.perms && req.perms >= constants.ADMIN_PERM) {
        newUser2.perms = newUser.perms;
    }
    if (newUser2.error) {
        return res.status(200).send(newUser2);
    }
    const user = User.findByIdAndUpdate(req.params.id, newUser2)
        .then(user => {
            res.status(200).send(user);
        })
        .catch(error => {
            console.log(error);
            res.sendStatus(400);
        })
});
router.get("/", async (req, res, next) => {
    User.find()
        .select("username profilePic power experience solved")
        .then(results => {
            res.status(200).send(results);
        })
        .catch(error => {
            console.log(error);
            res.sendStatus(500);
        });
});
router.post("/codeforces", async (req, res, next) => {
    try {
        if (!req.curUser) {
            return res.sendStatus(400);
        }
        const { account } = req.query;
        const response = await fetch("https://codeforces.com/api/user.info?handles=" + account);
        let data = await response.json();
        if (data.status == "FAILED") {
            return res.sendStatus(404);
        }
        data=data.result[0];
        if(data.firstName!="herriot_"+req.curUser&&data.maxRating>=1900){
            return res.sendStatus(403);
        }
        await User.findByIdAndUpdate(req.curUser, { perms: Math.max(req.perms, constants.PROBLEM_PERM) })
        res.sendStatus(200);
    } catch (error) {
        console.log(error);
        res.sendStatus(400);
    }
});

async function createUser(user, oldUsername = null, oldPassword = null) {
    error = [];
    let { username, password, profilePic, description } = user;

    if (oldUsername && !username) {
        username = oldUsername;
    }
    else if (!username) {
        error.push("No username provided");
    }
    else {
        username = username.trim();
        username = sanitizeHtml(username);
        username = username.toLowerCase();
        if (!username || username.length > 100) {
            error.push("Username must be 1-100 characters.");
        }
        else if (username != oldUsername) {
            const user = await User.findOne({ username: username })
                .catch((error) => {
                    error.push("Error");
                });
            if (user) {
                error.push("Username already in use.");
            }
        }
    }
    if (oldPassword && !password) {
        password = oldPassword;
    }
    else if (!password) {
        error.push("No password");
    }
    else if (password.length > 256) {
        error.push("Password must be 256 characters or less");
    }
    else {
        password = await bcrypt.hash(password, 10);
    }

    if (error.length) {
        error = error.join("<br>");
        return { error };
    }

    if (!profilePic) {
        profilePic = "/images/profile_pics/defaults/" + Math.floor(Math.random() * 16 + 1);
    }
    profilePic = profilePic.substring(0, 1000);

    description = sanitizeHtml(description);
    description = description.trim();
    description = description.substring(0, 10000);

    return { username, password, profilePic, description };
}
module.exports = router;