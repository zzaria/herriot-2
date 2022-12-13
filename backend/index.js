const rooty=require('rooty');
rooty();
const express = require('express');
const app = express();
const port = 3003;
const middleware = require('^middleware')
const path = require('path')
const bodyParser = require("body-parser")
const mongoose = require("./database");
const cors = require('cors')

const server = app.listen(port, () => console.log("Server listening on port " + port));

app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

app.use("/api/problem", middleware.userAuth, require('^routes/api/problem'));
app.use("/api/tag", middleware.userAuth, require('^routes/api/tag'));
app.use("/api/tagproblem", middleware.userAuth, require('^routes/api/tagproblem'));
app.use("/api/taguser", middleware.userAuth, require('^routes/api/taguser'));
app.use("/api/vote", middleware.userAuth, require('^routes/api/vote'));
app.use("/api/user", middleware.userAuth, require('^routes/api/user'));
app.use("/api/account", middleware.userAuth, require('^routes/api/account'));
app.use("/api/post", middleware.userAuth, require('^routes/api/post'));
app.use("/api/import", middleware.userAuth, require('^routes/api/import'));