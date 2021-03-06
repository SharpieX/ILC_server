const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const questionSchema = new Schema({
    title: {type: String, required: true},
    actions: { type: Schema.Types.Mixed, default: {}},
    text: {type: String, required: true},
    answers: [{
        type: Schema.Types.ObjectId,
        ref: 'answer'
    }],
    author: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    views: Number,
    users_upvote:[{
        type: Schema.Types.ObjectId,
        ref: 'user'
    }],
    users_DownVote:[{
        type: Schema.Types.ObjectId,
        ref: 'user'
    }],
    comments:[ {
        type: Schema.Types.ObjectId,
        ref: 'comment'
    }],
    created_date:{type: Date, default: Date.now},
    updated_date:Date,
    tags: [{
        type: Schema.Types.ObjectId,
        ref: 'tag'
    }],
}, { minimize: false });

module.exports = mongoose.model('question', questionSchema);