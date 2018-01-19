const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');

const userSchema = new Schema({
	providerId: { type: String, index: true },
	email: { type: String, unique: true, lowercase: true },
	password: { type: String, select: false },
	passwordResetToken: String,
	passwordResetExpires: Date,
	username: String,
	fullName: String,
	picture: String,
	accessToken: String,
	created_date:{type: Date, default: Date.now},
	updated_date:Date,
	phone:String,
	role: String,
});

userSchema.pre('save', function(next) {
	var user = this;
	if (!user.isModified('password')) {
		return next();
	}
	bcrypt.genSalt(10, function(err, salt) {
		bcrypt.hash(user.password, salt, function(err, hash) {
			user.password = hash;
			next();
		});
	});
});

userSchema.methods.comparePassword = function(password, done) {
	bcrypt.compare(password, this.password, function(err, isMatch) {
		done(err, isMatch);
	});
};

userSchema.options.toJSON = {
	transform: function(doc, ret, options) {
		delete ret.password;
		delete ret.passwordResetToken;
		delete ret.passwordResetExpires;
	}
};


module.exports = mongoose.model('user', userSchema);