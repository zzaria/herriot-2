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
const { ObjectId } = require('mongodb');

router.all("/", async (req, res, next) => {
    if (req.perms < constants.ADMIN_PERM) {
        return res.sendStatus(403);
    }
    /*
    let cur=await Problem.find();
    let i=0;
    cur.forEach(async p => {
        if(i++<9820){
            return;
        }
        let id=p.name.split(" - ")[0];
        let name=p.name.substring(p.name.indexOf(" - ")+3);
        console.log({external_id:id,name:name+" ("+id+")"});
        await Problem.findByIdAndUpdate(p._id,{external_id:id,name:name+" ("+id+")"});
    });
    return res.sendStatus(200);//*/
    
    //*
    let data;
    data=[];
    //data=data.concat(await usaco());
    let cur=await Problem.find();
    cur=cur.map(p=>p.external_id);
    cur=new Set(cur);
    data=data.concat(await codeforce(cur));
    data=data.concat(await atcoder(cur));
    data=data.concat(await oichecklist(cur));
    console.log(data);
    await Problem.insertMany(data);//*/
    //*
    data=[];
    data=await cfRating();
    console.log(data);//*/
    res.sendStatus(200);
});
async function usaco(){
    let cur=await Problem.find();
    cur=cur.map(p=>p.name.split(" - ")[0]);
    cur=new Set(cur);
    const fs = require('fs');
    let data=fs.readFileSync('usaco.txt').toString();
    data=JSON.parse(data);
    data=JSON.parse(data);
    let ix=1,pn;
    data=data.map((data,index) => {
        let problem={};
        problem.name="USACO "+data.contest;
        let contest=['p','g','s','b'];
        problem.name+=" "+contest[data.type];
        ix++;
        if(pn!=problem.name){
            ix=1;
            pn=problem.name;
        }
        problem.name+=ix;
        if(cur.has(problem.name)){
            return null;
        }
        problem.name+=" - "+data.name;
        problem.difficulty=data.rating2;
        problem.quality=data.quality;
        problem.statement=problem.judge=data.url;
        let info=data.contest.split(' ');
        let link2="http://usaco.org/index.php?page="+info[1].toLowerCase()+info[0].substring(2)+"results";
        problem.editorial=problem.solution=problem.data=link2;
        return problem;
    });
    data=data.filter(data=>data!==null);
    return data;
}
async function codeforce(cur){

    fetch=require('node-fetch');
    const response = await fetch("https://codeforces.com/api/problemset.problems");
    let data=await response.json();

    data=data.result.problems;
    data=data.map(data=>{
        let problem={};
        problem.external_id="Codeforces "+data.contestId+data.index;
        if(cur.has(problem.external_id)){
            return null;
        }
        problem.name=`${data.name} (${problem.external_id})`;
        problem.difficulty=data.rating;
        if(!problem.difficulty){
            return null;
        }
        problem.judge=problem.statement=problem.editorial=`https://codeforces.com/contest/${data.contestId}/problem/${data.index}`;
        problem.solution=`https://codeforces.com/contest/${data.contestId}/status/${data.index}`;
        problem.difficulty_lock=true;
        return problem;
    });
    data=data.filter(data=>data!==null);
    return data;
}
async function atcoder(cur){

    fetch=require('node-fetch');
    let response = await fetch("https://kenkoooo.com/atcoder/resources/problem-models.json");
    let difficulty=await response.json();
    response = await fetch("https://kenkoooo.com/atcoder/resources/problems.json");
    let data=await response.json();
    data=data.map(data=>{
        let problem={};
        problem.external_id="Atcoder "+data.id;
        if(cur.has(problem.external_id)){
            return null;
        }
        problem.name=`${data.title} (${problem.external_id})`;
        let d=difficulty[data.id];
        if(d){
            d=d.difficulty;
            d=0.7565*d+ 710.66667;
            d=Math.round(Math.max(-1000,d));
            if(d){
                problem.difficulty=d;
            }
        }

        problem.judge=problem.statement=problem.solution=
        `https://atcoder.jp/contests/${data.contest_id}/tasks/${data.id}`;
        problem.editorial=`https://atcoder.jp/contests/${data.contest_id}/tasks/${data.id}/editorial`;
        problem.data=`https://www.dropbox.com/sh/nx3tnilzqz7df8a/AAAYlTq2tiEHl5hsESw6-yfLa?dl=0`;
        problem.difficulty_lock=true;
        return problem;
    });
    data=data.filter(data=>data!==null);
    return data;
}
async function oichecklist(cur){

    fetch=require('node-fetch');
    let response = await fetch("https://raw.githubusercontent.com/labs-asterisk/oichecklist/main/src/data/problem_data.json");
    let data=await response.json();
    data=data['sections'];
    data=data.map(data=>{
        let problem={};
        problem.external_id="Atcoder "+data.id;
        if(cur.has(problem.external_id)){
            return null;
        }
        problem.name=`${data.title} (${problem.external_id})`;
        let d=difficulty[data.id];
        if(d){
            d=d.difficulty;
            d=0.7565*d+ 710.66667;
            d=Math.round(Math.max(-1000,d));
            if(d){
                problem.difficulty=d;
            }
        }

        problem.judge=problem.statement=problem.solution=
        `https://atcoder.jp/contests/${data.contest_id}/tasks/${data.id}`;
        problem.editorial=`https://atcoder.jp/contests/${data.contest_id}/tasks/${data.id}/editorial`;
        problem.data=`https://www.dropbox.com/sh/nx3tnilzqz7df8a/AAAYlTq2tiEHl5hsESw6-yfLa?dl=0`;
        problem.difficulty_lock=true;
        return problem;
    });
    data=data.filter(data=>data!==null);
    return data;
}

async function cfRating(){
    return//update and add atcoder
    let cur=await Problem.find();

    const fs = require('fs');
    let data=fs.readFileSync('cfdif.csv').toString();
    data=data.split('\r\n');
    data.forEach(async data=>{
        data=data.split(',');
        data[0]="Codeforces "+data[0];
        await Problem.findOneAndUpdate({external_id:data[0]},{difficulty:data[1]});
    });
    return;
}
module.exports = router;
