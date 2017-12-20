const User = require('../models/user');
const moment = require('moment');
const bcrypt = require('bcryptjs');
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
			res.send(user);
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
			user.displayName = req.body.displayName || user.displayName;
			user.email = req.body.email || user.email;
			user.save(function (err) {
				res.status(200).end();
			});
		});
	},

	login(req, res) {
		User.findOne({ email: req.body.email }, '+password', function(err, user) {
			if (!user) {
				return res.status(401).send({ message: 'Invalid email and/or password' });
			}
			user.comparePassword(req.body.password, function(err, isMatch) {
				if (!isMatch) {
					return res.status(401).send({ message: 'Invalid email and/or password' });
				}
				res.send({ token: createJWT(user) });
			});
		});
	},

	signUp(req, res) {
		User.findOne({ email: req.body.email }, function(err, existingUser) {
			if (existingUser) {
				return res.status(409).send({ message: 'Email is already taken' });
			}
			var user = new User({
				fullName: req.body.displayName,
				email: req.body.email,
				password: req.body.password
			});
			user.save(function(err, result) {
				if (err) {
					res.status(500).send({ message: err.message });
				}
				res.send({ token: createJWT(result) });
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
					User.findOne({facebook: profile.id}, function (err, existingUser) {
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
							user.picture = user.picture || 'https://graph.facebook.com/v2.3/' + profile.id + '/picture?type=large';
							user.fullName = user.displayName || profile.name;
							user.email = profile.email;
							user.save(function () {
								const token = createJWT(user);
								res.send({token: token});
							});
						});
					});
				} else {
					// Step 3. Create a new user account or return an existing one.
					User.findOne({facebook: profile.id}, function (err, existingUser) {
						if (existingUser) {
							const token = createJWT(existingUser);
							return res.send({token: token});
						}
						const user = new User();
						user.providerId = profile.id;
						user.picture = 'https://graph.facebook.com/' + profile.id + '/picture?type=large';
						user.fullName = profile.name;
						user.email = profile.email;
						user.save(function () {
							const token = createJWT(user);
							res.send({token: token});
						});
					});
				}
			});
		});
	}
};