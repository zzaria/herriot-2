const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ProblemSchema = new Schema({
    external_id: {type: String, trim:true, unique:true},
    name: { type: String, trim: true,required:true},
    setter: {type: String, trim:true},
    thumbnail: { type: String, trim: true},
    judge: { type: String, trim: true},
    statement: { type: String, trim: true},
    editorial: { type: String, trim: true},
    solution: { type: String, trim: true},
    data: { type: String, trim: true},
    difficulty: { type: Number},
    quality: { type: Number},
    difficulty_lock:{type:Boolean,default:false},
    quality_lock:{type:Boolean,default:false},
    deleted:{type:Boolean,default:false},
    tags: {type: [{ type: Schema.Types.ObjectId, ref: 'Tag'}], default:[]},
}, { timestamps: true ,strict: true}, );

module.exports = mongoose.model('Problem', ProblemSchema);