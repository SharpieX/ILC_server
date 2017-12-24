const nodemailer = require("nodemailer");
const config = require('../config/config');
const transport = nodemailer.createTransport({
	service: "hotmail",
	auth: {
		user: config.email,
		pass: config.emailSec
	}
});

module.exports = {
	sendEmail(req, res) {
		const mailOptions = {
			to: config.email,
			subject: req.body.subject,
			html: '<b>from: ' + req.body.from + '</b> </br> <p>' + req.body.text + '</p>'
		};
		transport.sendMail(mailOptions, function (error, response) {
			if (error) {
				console.log(error);
				res.send({error: 1, msg: 'Something bad happened'});
			} else {
				console.log("Message sent: " + response.message);
				res.send({error: 0, msg: 'Message Sent'});
			}
		});
	}
}