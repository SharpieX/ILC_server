const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const tagSchema = new Schema({
    name: {type: String, unique: true, required: true},
    count: Number,
    excerpt: String,
});

module.exports = mongoose.model('tag', tagSchema);