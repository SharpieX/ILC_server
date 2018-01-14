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
			to: req.body.to ? req.body.to : config.email,
			subject: req.body.subject,
			html: '<b>Name: ' + req.body.name + ':' + req.body.phone + '</b> </br> <b>Email:' + req.body.from + '</b> </br> <p>' + req.body.text + '</p>'
		};

		if(req.body.html){
			mailOptions.html = req.body.text;
		}

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