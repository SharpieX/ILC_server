const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const commentSchema = new Schema({
    author: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    created_date:{type: Date, default: Date.now},
    text : String,
});

module.exports = mongoose.model('comment', commentSchema);