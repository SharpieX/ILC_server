const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const answerSchema = new Schema({
    text: {type: String, required: true},
    author: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    checked: Boolean,
    created_date:{type: Date, default: Date.now},
    updated_date:Date,
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
    actions: { type: Schema.Types.Mixed, default: {}},
},{ minimize: false });

module.exports = mongoose.model('answer', answerSchema);