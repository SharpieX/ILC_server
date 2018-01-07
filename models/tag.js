const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const tagSchema = new Schema({
	name: {type: String, required: true},
	count: Number,
	excerpt: String,
	id:String,
	type: String,
	level:Number,
	visible:Boolean,
	category:Number,
	subject:String,
});

module.exports = mongoose.model('tag', tagSchema);