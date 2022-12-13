const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const VoteSchema = new Schema({
    type: { type: Number, trim: true,required: true},
    value: {type:Number},
    parent: { type: Schema.Types.ObjectId,required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User',required: true },
});

module.exports = mongoose.model('Vote', VoteSchema);