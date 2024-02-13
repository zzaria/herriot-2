const rooty = require('rooty');
rooty();
const constants = require('^constants');
const express = require('express');
const app = express();
const router = express.Router();
const bodyParser = require("body-parser")
const Problem = require('^models/Problem');
const Tag = require('^models/Tag');
const { ObjectId } = require('mongodb');

router.get("/:id", async (req, res, next) => {
    try {
        let problem = await Problem.findById(req.params.id).populate("tags");
        let tags = new Set();
        if (req.curUser) {
            tags = new Set(req.curUserData.tags.map(tag => String(tag.tag)));
        }
        problem.tags = problem.tags.filter(tag => tag.public || tags.has(String(tag._id)));
        res.status(200).send(problem);
    } catch (error) {
        res.sendStatus(400);
    }
});
router.put("/:id", (req, res, next) => {
    if (req.perms < constants.PROBLEM_PERM) {
        return res.sendStatus(403);
    }
    const { newProblem } = req.body;
    delete newProblem._id;
    function strip_tags(html) {
      args=['span', 'dd', 'b', 'i', 'u', 'p', 'br','ul','li','h1','h2','h3','h4','h5','img','iframe'];
      return html.replace(/<(\/?)(\w+)[^>]*\/?>/g, (str, endMark, tag) => {
        return args.includes(tag) ? str :'';
      }).replace(/<!--.*?-->/g, '');
    }
    if (newProblem.statement) {
        newProblem.statement = strip_tags(newProblem.statement);
    }
    if (newProblem.editorial) {
        newProblem.editorial = strip_tags(newProblem.editorial);
    }
    if (newProblem.solution) {
        newProblem.solution = strip_tags(newProblem.solution);
    }
    if (newProblem.data) {
        newProblem.data = strip_tags(newProblem.data);
    }
    if (newProblem.judge) {
        newProblem.judge = strip_tags(newProblem.judge);
    }

    Problem.findByIdAndUpdate(req.params.id, newProblem).then(()=>res.sendStatus(200))
        .catch(error => {
            console.log(error);
            res.sendStatus(400);
        })
});

router.get("/", async (req, res, next) => {
    try {
        let filter = {deleted:false}, qfilter = req.query.filter,sort={},skip=0;
        if (qfilter) {
            qfilter = JSON.parse(qfilter);
            if(qfilter.hasEditorial==true){
                filter.editorial={$nin:[null,""]};
            }
            if(qfilter.hasCode==true){
                filter.solution={$nin:[null,""]};
            }
            if(qfilter.hasData==true){
                filter.data={$nin:[null,""]};
            }
            if (qfilter.difficulty && (qfilter.difficulty[0] != -1000 || qfilter.difficulty[1] != 5000)) {
                filter.difficulty = { $gte: qfilter.difficulty[0], $lte: qfilter.difficulty[1] };
            }
            if (qfilter.quality && (qfilter.quality[0] != 0 || qfilter.quality[1] != 5)) {
                filter.quality = { $gte: qfilter.quality[0], $lte: qfilter.quality[1] };
            }
            if (qfilter.search && qfilter.search !== "") {
                filter.name = { $regex: qfilter.search, $options: "i" };
            }
            if(qfilter.tags&&qfilter.tags.length||qfilter.antiTags&&qfilter.antiTags.length){
                filter.tags={};
                const publicTags=await Tag.find({public:true}).select("_id");
                const userTags=req.curUserData.tags.map(tag=>String(tag.tag));
                const tagList=new Set(publicTags.map(tag=>String(tag._id)).concat(userTags));
                if(qfilter.tags&&qfilter.tags.length){
                    qfilter.tags=qfilter.tags.filter(tag=>tagList.has(tag));
                    filter.tags.$in=qfilter.tags;
                }
                if(qfilter.antiTags&&qfilter.antiTags.length){
                    qfilter.antiTags=qfilter.antiTags.filter(tag=>tagList.has(tag));
                    filter.tags.$nin=qfilter.antiTags;
                }
            }
            if(qfilter.sortKey=="random"){
                const results = await Problem.aggregate ( [ { $sample: { size: 15 } } ]);
                return res.status(200).send(results);
            }
            if(qfilter.sortKey&&qfilter.sortOrder){
                sort[qfilter.sortKey]=qfilter.sortOrder=="ascend"? 1:-1;
            }
            if(qfilter.page){
                skip=200*qfilter.page-200;
            }
        }

        const start = new Date();
        const results = await Problem.find(filter).sort(sort).skip(skip).limit(200).select("name setter thumbnail difficulty quality deleted");
        const count = await Problem.find(filter).countDocuments();
        res.status(200).send({count,results});
    } catch (error) {
        console.log(error);
        res.sendStatus(400);
    }
});
router.post("/", (req, res, next) => {
    if (req.perms < constants.PROBLEM_PERM) {
        return res.sendStatus(403);
    }
    Problem.create({ name: "new problem" })
        .then(newProblem => {
            res.status(201).send(newProblem._id);
        });
});

module.exports = router;
