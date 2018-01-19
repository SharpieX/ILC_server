const User = require('../models/user');
const moment = require('moment');
const async = require('async');
const bcrypt = require('bcryptjs');
const nodemailer = require("nodemailer");
const crypto = require('crypto');
const jwt = require('jwt-simple');
const config = require('../config/config');
const request = require('request');

function createJWT(user) {
	const payload = {
		sub: user._id,
		iat: moment().unix(),
		exp: moment().add(14, 'days').unix()
	};
	return jwt.encode(payload, config.tokenSecret);
}


module.exports = {

	getUsers(req, res) {
		User.find({})
		.then((users) => {
			res.send({data: users, msg: 'All users', err: 0})
		})
	},

	getUserByUUID(req, res) {
		let id = req.query.id;
		let find_obj = {id: id};
		User.findOne(find_obj)
		.then((savedUser) => {
			if (savedUser !== null) {
				res.send({data: savedUser, msg: 'Authentication Successful', err: 0})
			} else {
				res.send({data: savedUser, msg: 'Authentication Failed ', err: 2})
			}
		});
	},

	getUserById(req, res) {
		let id = req.query.id;
		User.findById(id)
		.then((user) => {
			res.send({data: user, msg: 'User', err: 0})
		})
	},

	/*
	|--------------------------------------------------------------------------
	| GET /api/me
	|--------------------------------------------------------------------------
	*/
	getUser(req, res) {
		User.findById(req.user, function (err, user) {
			if (user) {
				res.send(user);
			} else {
				res.send('Some thing bad happened ');
			}

		});
	},

	/*
	 |--------------------------------------------------------------------------
	 | PUT /api/me
	 |--------------------------------------------------------------------------
	 */
	updateUser(req, res) {
		User.findById(req.user, function (err, user) {
			if (!user) {
				return res.status(400).send({message: 'User not found'});
			}
			user.fullName = req.body.fullName || user.fullName;
			user.email = req.body.email || user.email;
			user.updated_date = new Date().toISOString();
			user.save(function (err) {
				res.status(200).end();
			});
		});
	},

	login(req, res) {
		User.findOne({email: req.body.email}, '+password', function (err, user) {
			if (!user) {
				return res.status(401).send({message: 'Invalid email and/or password'});
			}
			user.comparePassword(req.body.password, function (err, isMatch) {
				if (!isMatch) {
					return res.status(401).send({message: 'Invalid email and/or password'});
				}
				res.send({token: createJWT(user), user: user.toJSON()});
			});
		});
	},

	signUp(req, res) {
		User.findOne({email: req.body.email}, function (err, existingUser) {
			if (existingUser) {
				return res.status(409).send({message: 'Email is already taken'});
			}
			var user = new User({
				fullName: req.body.displayName,
				email: req.body.email,
				password: req.body.password,
				phone: req.body.phone,
				role: 'user'
			});
			user.save(function (err, result) {
				if (err) {
					res.status(500).send({message: err.message});
				}
				res.send({token: createJWT(result)});
			});
		});
	},

	facebook(req, res) {
		const fields = ['id', 'email', 'first_name', 'last_name', 'link', 'name'];
		const accessTokenUrl = 'https://graph.facebook.com/v2.5/oauth/access_token';
		const graphApiUrl = 'https://graph.facebook.com/v2.5/me?fields=' + fields.join(',');
		const params = {
			code: req.body.code,
			client_id: req.body.clientId,
			client_secret: config.clientSecret,
			redirect_uri: req.body.redirectUri
		};

		// Step 1. Exchange authorization code for access token.
		request.get({url: accessTokenUrl, qs: params, json: true}, function (err, response, accessToken) {
			if (response.statusCode !== 200) {
				return res.status(500).send({message: accessToken.error.message});
			}

			// Step 2. Retrieve profile information about the current user.
			request.get({url: graphApiUrl, qs: accessToken, json: true}, function (err, response, profile) {
				if (response.statusCode !== 200) {
					return res.status(500).send({message: profile.error.message});
				}
				if (req.header('Authorization')) {
					User.findOne({providerId: profile.id}, function (err, existingUser) {
						if (existingUser) {
							return res.status(409).send({message: 'There is already a Facebook account that belongs to you'});
						}
						const token = req.header('Authorization').split(' ')[1];
						const payload = jwt.decode(token, config.tokenSecret, false);
						User.findById(payload.sub, function (err, user) {
							if (!user) {
								return res.status(400).send({message: 'User not found'});
							}
							user.providerId = profile.id;
							user.picture = user.picture || 'https://graph.facebook.com/v2.3/' + profile.id + '/picture?type=small';
							user.fullName = user.displayName || profile.name;
							user.email = profile.email;
							user.role = 'user',
								user.save(function () {
									const token = createJWT(user);
									res.send({token: token});
								});
						});
					});
				} else {
					// Step 3. Create a new user account or return an existing one.
					User.findOne({providerId: profile.id}, function (err, existingUser) {
						if (existingUser) {
							const token = createJWT(existingUser);
							return res.send({token: token});
						}
						const user = new User();
						user.providerId = profile.id;
						user.picture = 'https://graph.facebook.com/' + profile.id + '/picture?type=large';
						user.fullName = profile.name;
						user.email = profile.email;
						user.role = 'user';
						user.save(function () {
							const token = createJWT(user);
							res.send({token: token});
						});
					});
				}
			});
		});
	},
	/**
	 * POST /forgot
	 */
	forgotPost(req, res, next) {
		req.assert('email', 'Email is not valid').isEmail();
		req.assert('email', 'Email cannot be blank').notEmpty();
		req.sanitize('email').normalizeEmail({remove_dots: false});

		const errors = req.validationErrors();

		if (errors) {
			return res.status(400).send(errors);
		}

		async.waterfall([
			function (done) {
				crypto.randomBytes(16, function (err, buf) {
					const token = buf.toString('hex');
					done(err, token);
				});
			},
			function (token, done) {
				User.findOne({email: req.body.email}, function (err, user) {
					if (!user) {
						return res.status(400).send({msg: 'The email address ' + req.body.email + ' is not associated with any account.'});
					}
					user.passwordResetToken = token;
					user.passwordResetExpires = Date.now() + 3600000; // expire in 1 hour
					user.updated_date = new Date().toISOString();
					user.save(function (err) {
						done(err, token, user);
					});
				});
			},
			function (token, user, done) {
				const transporter = nodemailer.createTransport({
					service: "hotmail",
					auth: {
						user: config.email,
						pass: config.emailSec
					}
				});

				const mailOptions = {
					to: user.email,
					from: config.email,
					subject: '✔ Reset your password on ILC',
					text: 'You are receiving this email because you (or someone else) have requested the reset of the password for your account.\n\n' +
					'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
					'http://' + req.headers.host + '/#!/reset/' + token + '\n\n' +
					'If you did not request this, please ignore this email and your password will remain unchanged.\n'
				};
				transporter.sendMail(mailOptions, function (err) {
					res.send({msg: 'An email has been sent to ' + user.email + ' with further instructions.'});
					done(err);
				});
			}
		]);
	},

	/**
	 * POST /reset
	 */
	resetPost(req, res, next) {
		req.assert('password', 'Password must be at least 4 characters long').len(4);
		req.assert('confirm', 'Passwords must match').equals(req.body.password);

		const errors = req.validationErrors();

		if (errors) {
			return res.status(400).send(errors);
		}

		async.waterfall([
			function (done) {
				User.findOne({passwordResetToken: req.params.token})
				.where('passwordResetExpires').gt(Date.now())
				.exec(function (err, user) {
					if (!user) {
						return res.status(400).send({msg: 'Password reset token is invalid or has expired.'});
					}
					user.password = req.body.password;
					user.passwordResetToken = undefined;
					user.passwordResetExpires = undefined;
					user.updated_date = new Date().toISOString();
					user.save(function (err) {
						done(err, user);
					});
				});
			},
			function (user, done) {
				const transporter = nodemailer.createTransport({
					service: "hotmail",
					auth: {
						user: config.email,
						pass: config.emailSec
					}
				});
				const mailOptions = {
					from: config.email,
					to: user.email,
					subject: 'Your ILC password has been changed',
					text: 'Hello,\n\n' +
					'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
				};
				transporter.sendMail(mailOptions, function (err) {
					res.send({msg: 'Your password has been changed successfully.'});
				});
			}
		]);
	},

};