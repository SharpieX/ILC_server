const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const workSchema = new Schema({
	name: {type: String, required: true},
	tags: [{
		type: Schema.Types.ObjectId,
		ref: 'tag'
	}],
	uuid: String,
	visible:Boolean,
});

module.exports = mongoose.model('homework', workSchema);