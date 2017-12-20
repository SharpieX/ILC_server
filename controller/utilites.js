const User = require('../models/user');
const moment = require('moment');
const jwt = require('jwt-simple');
const config = require('../config/config');

module.exports = {

	isAuthenticated(req, res, next) {
		if (!(req.headers && req.headers.authorization)) {
			return res.status(400).send({message: 'You did not provide a JSON Web Token in the Authorization header.'});
		}
		const header = req.headers.authorization.split(' ');
		const token = header[1];
		const payload = jwt.decode(token, config.tokenSecret);
		const now = moment().unix();

		if (now > payload.exp) {
			return res.status(401).send({message: 'Token has expired.'});
		}

		User.findById(payload.sub, function (err, user) {
			if (!user) {
				return res.status(400).send({message: 'User no longer exists.'});
			}

			req.user = user;
			next();
		})
	},



	ensureAuthenticated(req, res, next) {
		if (!req.header('Authorization')) {
			return res.status(401).send({message: 'Please make sure your request has an Authorization header'});
		}
		const token = req.header('Authorization').split(' ')[1];

		var payload = null;

		try {
			payload = jwt.decode(token, config.tokenSecret);
		}
		catch (err) {
			return res.status(401).send({message: err.message});
		}

		if (payload.exp <= moment().unix()) {
			return res.status(401).send({message: 'Token has expired'});
		}
		req.user = payload.sub;
		next();
	}
};

