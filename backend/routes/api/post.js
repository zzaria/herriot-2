const rooty = require('rooty');
rooty();
const constants = require('^constants');
const express = require('express');
const app = express();
const router = express.Router();
const bodyParser = require("body-parser")
const Post = require('^models/Post');
const User = require('^models/User');
const { ObjectId } = require('mongodb');


router.put("/:id", async (req, res, next) => {
    const postId = req.params.id;
    let { title, content } = req.query;
    content = content.replace(/(<([^>]+)>)/ig, '');

    const oldPost = await Post.findById(postId);
    if (!oldPost || (oldPost.author != req.curUser && req.perms < constants.ADMIN_PERM)) {
        return res.sendStatus(403);
    }
    Post.findByIdAndUpdate(postId, { title, content })
        .then(user => {
            res.sendStatus(200);
        })
        .catch(error => {
            console.log(error);
            res.sendStatus(400);
        })
});
router.post("/", async (req, res, next) => {
    let { title, content, problem, parent } = req.query;
    content = content.replace(/(<([^>]+)>)/ig, '');
    if (!req.curUser) {
        return res.sendStatus(400);
    }
    if (problem == constants.ANNOUNCEMENT_POST && req.perms < constants.ADMIN_PERM) {
        return res.sendStatus(403);
    }
    try {
        if (!parent) {
            parent = null;
        }
        await Post.create({ title, content, author: req.curUser, problem, parent });
        return res.sendStatus(200);
    } catch (error) {
        console.log(error);
    }
});
router.get("/", async (req, res, next) => {
    let { parent, problem } = req.query;
    try {
        filter = { problem };
        if (parent) {
            filter.parent = parent;
        }
        let posts = await Post.find(filter).populate("author", ["username", "profilePic", "power"]);
        if (posts) {
            return res.status(200).send(posts);
        }
        else {
            return res.sendStatus(400);
        }
    } catch (error) {
        console.log(error);
        return res.sendStatus(400);
    }
});
module.exports = router;