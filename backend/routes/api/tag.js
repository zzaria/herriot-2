const rooty = require('rooty');
rooty();
const constants = require('^constants');
const express = require('express');
const app = express();
const router = express.Router();
const bodyParser = require("body-parser")
const User = require('^models/User');
const Tag = require('^models/Tag');
const Problem = require('^models/Problem');
const { tagEditAccess, tagViewAccess } = require('^middleware');
const { ObjectId } = require('mongodb');

router.get("/:id", async (req, res, next) => {
    let tag = req.params.id;
    try {
        if (!await tagViewAccess(tag, req.curUserData)) {
            return res.sendStatus(403);
        }
        tag = await Tag.findById(tag).orFail().populate("users.user", ["username", "profilePic"]).populate("problems.problem", ["name", "difficulty", "quality", "thumbnail","setter"]);
        res.status(200).send(tag);
    } catch (error) {
        console.log(error);
        return res.sendStatus(400);
    }
});
router.put("/:id", async (req, res, next) => {
    const { newTag } = req.body;
    const tagId = req.params.id;
    if (!await tagEditAccess(tagId, req.curUserData)) {
        return res.sendStatus(403);
    }
    delete newTag._id;
    delete newTag.users;
    delete newTag.problems;
    if (req.perms < constants.PROBLEM_PERM) {
        delete newTag.public;
    }
    Tag.findByIdAndUpdate(tagId, newTag)
        .then(tag => {
            res.sendStatus(200);
        })
        .catch(error => {
            console.log(error);
            res.sendStatus(400);
        })
});
router.get("/", async (req, res, next) => {
    Tag.find({ public: true })
        .select("name thumbnail spoiler problems")
        .then(results => {
            res.status(200).send(results);
        });
});
router.post("/", async (req, res, next) => {
    if (req.perms < 0) {
        return res.status(403);
    }
    let userTagCount = await User.findById(req.curUser);
    userTagCount = userTagCount.tags.length + 1;
    Tag.create({ name: `Collection #${userTagCount}`, users: [{ user: req.curUser, access: 0 }] })
        .then(async newTag => {
            await User.findByIdAndUpdate(req.curUser, { $addToSet: { tags: { tag: newTag._id, access: 0 } } });
            res.status(201).send(newTag._id);
        });
});
module.exports = router;