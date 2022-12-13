const rooty=require('rooty');
rooty();
const constants= require('^constants');
const express = require('express');
const app = express();
const router = express.Router();
const bodyParser = require("body-parser")
const User = require('^models/User');
const Tag = require('^models/Tag');
const Problem = require('^models/Problem');
const { tagEditAccess,tagViewAccess} = require('^middleware');
const { ObjectId } = require('mongodb');

router.post("/", async (req, res, next) => {
    let {user,tag,access}=req.query;
    if(!await tagEditAccess(tag,req.curUserData)){
        return res.sendStatus(403);
    }
    let tag2=await Tag.findById(tag);
    let user2=await User.findById(user);
    let existing=false;
    for(let i=0;i<tag2.users.length;i++){
        let p=tag2.users[i];
        if(p.user==user){
            existing=true;
            if(p.access>access){
                p.access=access;
            }
        }
    }
    for(let i=0;i<user2.tags.length;i++){
        let p=user2.tags[i];
        if(p.tag==tag){
            if(p.access>access){
                p.access=access;
            }
        }
    }
    if(!existing){
        tag2.users.push({user,access});
        user2.tags.push({tag,access});
    }
    await Tag.findByIdAndUpdate(tag,tag2);
    await User.findByIdAndUpdate(user,user2);
    return res.status(200).send();
});
router.put("/", async (req, res, next) => {
    let {tag,color}=req.query;
    if(!await tagViewAccess(tag,req.curUserData)){
        return res.sendStatus(403);
    }
    let user=req.curUser;
    let user2=await User.findById(user);
    for(let i=0;i<user2.tags.length;i++){
        let p=user2.tags[i];
        if(p.tag==tag){
            p.color=color;
        }
    }
    await User.findByIdAndUpdate(user,user2);
    return res.status(200).send();
});
router.delete("/", async (req, res, next) => {
    let {user,tag}=req.query;
    if(!await tagEditAccess(tag,req.curUserData)){
        return res.sendStatus(403);
    }
    let tag2=await Tag.findById(tag);
    let user2=await User.findById(user);
    if(user2.solved_tag==tag){
        console.log(user2.solved_tag,tag);
        return res.sendStatus(400);
    }
    for(let i=0;i<tag2.users.length;i++){
        let p=tag2.users[i];
        if(p.user==user&&(user==req.curUser||p.access==1||req.perms>=constants.PROBLEM_PERM)){
            tag2.users.splice(i,1);
        }
    }
    for(let i=0;i<user2.tags.length;i++){
        let p=user2.tags[i];
        if(p.tag==tag&&(user==req.curUser||p.access==1||req.perms>=constants.PROBLEM_PERM)){
            user2.tags.splice(i,1);
        }
    }
    await Tag.findByIdAndUpdate(tag,tag2);
    await User.findByIdAndUpdate(user,user2);
    return res.status(200).send(tag);
});
module.exports = router;