const rooty = require('rooty');
rooty();
const jwt = require("jsonwebtoken");
const constants = require("^constants");
const User = require('^models/User');
const Tag = require('^models/Tag');

exports.userAuth = async (req, res, next) => {
  req.perms = -1;
  try {
    if (req.headers && req.headers.usertoken) {
      let token = req.headers.usertoken;
      token = jwt.verify(token, constants.SECRET);
      req.curUser = token.userId;
      await User.findById(req.curUser).then(user => {
        req.perms = user.perms;
        req.curUserData = user;
      });
    }
  }
  catch (error) {
  }
  return next();
};
exports.tagEditAccess = async (tagId,user) => {
  return tagAccess(0, tagId,user);
}
exports.tagViewAccess = async (tagId,user) => {
  const tag=await Tag.findById(tagId)
  if (tag.public) {
    return true;
  }
  return tagAccess(1,tagId,user);
}
function tagAccess(accessLevel, tagId,user) {
  if (user.perms >= constants.PROBLEM_PERM) {
    return true;
  }
  try {
    let userTags = user.tags;
    let access = userTags.reduce((access, userTag) => access || userTag.access <= accessLevel && userTag.tag == tagId, false);
    return access;
  }
  catch (error) {
    console.log(error);
    return false;
  }
};