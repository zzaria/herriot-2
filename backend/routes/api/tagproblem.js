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

router.post("/", async (req, res, next) => {
    let { tag: tagId, problems } = req.body;
    let tag = await Tag.findById(tagId);
    if (!tag) {
        return res.sendStatus(404);
    }
    if (!await tagEditAccess(tagId, req.curUserData)) {
        return res.sendStatus(403);
    }
    let index = 0;
    let list = tag.problems.reduce((list, problem) => {
        list[problem.problem] = problem.index;
        index++;
        return list;
    }, {});
    let update = [];
    problems.forEach(problem => {
        if (!(problem in list)) {
            tag.problems.push({ problem, index });
            index++;
            update.push({
                updateOne: {
                    filter: { _id: problem },
                    update: { $push: { tags: tagId } }
                }
            });
        }
    });
    await Tag.findByIdAndUpdate(tagId, tag);
    await Problem.bulkWrite(update);
    if (tagId == req.curUserData.solved_tag) {
        await updateSolved(req.curUser);
    }
    res.sendStatus(200);
});
router.delete("/", async (req, res, next) => {
    let { tag: tagId, problems } = req.body;
    let tag = await Tag.findById(tagId);
    if (!tag) {
        return res.sendStatus(404);
    }
    if (!await tagEditAccess(tagId, req.curUserData)) {
        return res.sendStatus(403);
    }
    problems = new Set(problems);
    let list = tag.problems.sort((a, b) => a.index - b.index), newList = [];
    let index = 0;
    list.forEach(problem => {
        if (!problems.has(String(problem.problem))) {
            newList.push({ problem: problem.problem, index });
            index++;
        }
    })
    let update = [];
    problems.forEach(problem => {
        update.push({
            updateOne: {
                filter: { _id: problem },
                update: { $pull: { tags: tagId } }
            }
        });
    });
    tag.problems = newList;
    await Tag.findByIdAndUpdate(tagId, tag);
    await Problem.bulkWrite(update);
    if (tagId == req.curUserData.solved_tag) {
        await updateSolved(req.curUser);
    }
    res.sendStatus(200);
});
router.put("/", async (req, res, next) => {
    let { tag, newOrder } = req.body;
    if (!await tagEditAccess(tag, req.curUserData)) {
        return res.sendStatus(403);
    }
    newOrder = newOrder.map((problem, index) => { return { problem, index }; })
    await Tag.findByIdAndUpdate(tag, { problems: newOrder });
    res.sendStatus(200);
});
async function updateSolved(userId) {

    let user = await User.findById(userId).populate({
        path: "solved_tag",
        populate: {
            path: "problems.problem"
        }
    });
    let solved = user.solved_tag.problems.map(problem => problem.problem.difficulty);
    solved = solved.map(d => !d&&d!==0? -1000:d);
    solved = solved.sort((a, b) => a - b);
    let count = solved.length, xp = 0, power = 0;
    solved.forEach(d => {
        xp += 10 ** (d / 400);
        d = d >= 100 ? d : 100 / Math.exp((100 - d) / 100);
        power = power * constants.POWER_DECAY + d * (1 - constants.POWER_DECAY);
    });
    xp *= Math.max(count / 10, count - 10);
    power=Math.max(0,power+Math.log2(xp)-50);
    await User.findByIdAndUpdate(userId, { solved: count, experience: xp, power });
}
module.exports = router;
