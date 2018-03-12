const AWS = require('aws-sdk');
AWS.config.loadFromPath('./config/AwsConfig.json');
const fs = require('fs');
const S3 = new AWS.S3();
const HomeWork = require('../models/homework');

module.exports = {

	uploadAndSave : function(req, res){

		let file = req.files.file;
		let tags = req.body.tags;

		console.log(file);

		let fileBuffer = fs.readFileSync(file.file);

		S3.putObject({
			ACL: 'public-read',
			Bucket: 'ilcstorage',
			Key: file.uuid,
			Body: fileBuffer,
			ContentType: file.mimetype
		}, function(error, response) {
			if(error){
				res.json(error);
			} else {
				console.log('uploaded file');
				const homeWorkProp = {
					name:file.filename,
					uuid:file.uuid,
					visible:true,
					tags:tags,
				}
				HomeWork.create(homeWorkProp)
				.then((obj) => {
					res.send({err: 0, msg: 'homework uploaded successfully', data: file});
				});
			}
		});
	},

	getAssignments : function(req, res){
		HomeWork.find({})
		.populate('tags')
		.then((assignments)=>{
			res.send({data: assignments, msg: 'Answer', err: 0})
		})
	}
}