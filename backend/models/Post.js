const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const PostSchema = new Schema({
    title: { type: String, trim: true,default: "" },
    content: { type: String, trim: true,required: true},
    author: { type: Schema.Types.ObjectId, ref: 'User',required: true },
    parent: { type: Schema.Types.ObjectId, ref: 'Post'},
    problem: { type: Schema.Types.ObjectId, ref: 'Problem',required: true },
    score: {type:Number,default:0},
    deleted: {type:Boolean,default:false},
    private: {type:Boolean,default:false},
}, { timestamps: true });

module.exports = mongoose.model('Post', PostSchema);