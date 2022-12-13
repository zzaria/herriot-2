const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const TagSchema = new Schema({
    name: { type: String, trim: true ,required:true },
    thumbnail: String,
    banner: String,
    embed_title: Boolean,
    spoiler: Boolean,
    public: Boolean,
    problems: {type: [{
        problem: { type: Schema.Types.ObjectId, ref: 'Problem',required:true },
        index: { type:Number,required:true},
    }], default:[]},
    users: {type: [{
        user: { type: Schema.Types.ObjectId, ref: 'User',required:true },
        access: {type: Number,default:0},
    }], default:[]}
});

module.exports = mongoose.model('Tag', TagSchema);