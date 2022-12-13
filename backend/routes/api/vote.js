const rooty=require('rooty');
rooty();
const constants= require('^constants');
const express = require('express');
const app = express();
const router = express.Router();
const bodyParser = require("body-parser")
const Problem = require('^models/Problem');
const Vote = require('^models/Vote');
const Post = require('^models/Post');

app.use(bodyParser.urlencoded({ extended: false }));

router.get("/", async (req, res, next) => {
    try {
        const {type:type,parent:parent}=req.query;
        const user=req.curUser;
        if(!user||!parent||!type){
            return res.sendStatus(400);
        }
        const query={type:type,parent:parent,user:user};
        const vote=await Vote.findOne(query);
        if(!vote){
            return res.status(200).json();
        }
        res.status(200).json(vote.value);
    } catch (error) {
        res.sendStatus(400);
    }
});
router.post("/", async (req, res, next) => {
    let {type:type,value:value,parent:parent}=req.query;
    const user=req.curUser;
    if(!user||!parent||!type||!value){
        return res.status(400).json();
    }
    value=parseInt(value);
    if(isNaN(value)){
        return res.status(400).json();
    }
    if(type==0&&(value<-1||value>1)){
        return res.status(400).json();
    }
    if(type==1&&(value<-1000||value>5000)){
        return res.status(400).json();
    }
    if(type==2&&(value<1||value>5)){
        return res.status(400).json();
    }
    const options = { upsert: true, new: true, setDefaultsOnInsert: true };
    const query={type:type,parent:parent,user:user};
    Vote.findOneAndUpdate(query,{value:value},options).then(async ()=>{
        await updateVote(type,parent);
        return res.status(200).json();
    })
    .catch((error) => {
        console.log(error);
        return res.status(400).json();;
    });
});
router.delete("/", async (req, res, next) => {
    const {type:type,parent:parent}=req.query;
    const user=req.curUser;
    if(!user||!parent||!type){
        return res.status(400);
    }
    const options = { upsert: true, new: true, setDefaultsOnInsert: true };
    const query={type:type,parent:parent,user:user};
    Vote.findOneAndDelete(query).then(async ()=>{
        await updateVote(type,parent);
        return res.status(200).json();
    });
});
async function updateVote(type,parent){
    let votes=await Vote.find({type:type,parent:parent}).select("value");
    votes=votes.map(vote=>vote.value);
    if(type==0){
        let score=votes.reduce((sum,vote)=>sum+vote);
        await Post.findOneAndUpdate({_id:parent},{score:score});
    }
    if(type==1){
        votes=votes.sort();
        let len=votes.length-1;
        let difficulty= len>=0? (votes[Math.floor(len/2)]+votes[Math.ceil(len/2)])/2: null;
        await Problem.findOneAndUpdate({_id:parent,difficulty_lock:false},{difficulty:difficulty});
    }
    if(type==2){
        let quality=votes.length? Math.floor(votes.reduce((sum,vote)=>sum+vote,6)/(votes.length+2)*100)/100: null;
        await Problem.findOneAndUpdate({_id:parent,quality_lock:false},{quality:quality});
    }
}

module.exports = router;