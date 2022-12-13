const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const UserSchema = new Schema({
    username: { type: String, required: true, trim: true, unique: true },
    password: { type: String, required: true },
    profilePic: { type: String, default: "/images/profilePic.jpeg" },
    description: { type: String, default: "" },
    perms: { type: Number, default: 0 },
    power: { type: Number, default: 0 },
    experience: { type: Number, default: 0 },
    solved: { type: Number, default: 0 },
    tags: [{
        tag: { type: Schema.Types.ObjectId, ref: 'Tag' },
        access: {type:Number,default:0},
        color: String,
    }],
    solved_tag:{ type: Schema.Types.ObjectId, ref: 'Tag' },
}, { timestamps: true });

var User = mongoose.model('User', UserSchema);
module.exports = User;