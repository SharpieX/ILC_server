const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const workSchema = new Schema({
	name: {type: String, required: true},
	tags: [{
		type: Schema.Types.ObjectId,
		ref: 'tag'
	}],
	uuid: String,
	created_date: {type: Date, default: Date.now},
	updated_date: Date,
	visible: {type: Boolean, default: true},
});

module.exports = mongoose.model('homework', workSchema);