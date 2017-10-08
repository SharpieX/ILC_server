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
});

module.exports = mongoose.model('answer', answerSchema);