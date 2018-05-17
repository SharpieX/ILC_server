const AWS = require('aws-sdk');
const underscore = require('underscore');
AWS.config.loadFromPath('./config/AwsConfig.json');
const fs = require('fs');
const S3 = new AWS.S3();
const HomeWork = require('../models/homework');

module.exports = {

	uploadAndSave: function (req, res) {

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
		}, function (error, response) {
			if (error) {
				res.json(error);
			} else {
				console.log('uploaded file');
				const homeWorkProp = {
					name: file.filename,
					uuid: file.uuid,
					visible: true,
					tags: tags,
				}
				HomeWork.create(homeWorkProp)
				.then((assignment) => {
					assignment.populate('tags', function(err){
						res.send({err: 0, msg: 'homework uploaded successfully', data: assignment});
					})

				});
			}
		});
	},

	getAssignments: function (req, res) {
		let query = {visible:true};

		if(!underscore.isEmpty(req.body)){
			query = {$and:[{visible:true}]};
			if(req.body.class && req.body.class.length){
				query.$and.push({"tags.0":{$in:req.body.class}})
			}
			if(req.body.subject && req.body.subject.length){
				query.$and.push({"tags.1":{$in:req.body.subject}})
			}


		}

		HomeWork.find(query)
		.populate('tags')
		.then((assignments) => {
			res.send({data: assignments, msg: 'assignment saved', err: 0})
		})
	},

	removeAssignment: function (req, res) {
		HomeWork.findByIdAndUpdate(req.query.id, {$set: {visible: false, updated_date: new Date().toISOString()}},{new:true})
		.then((assignment, err) => {
			if (err) return res.status(500).send(err);
			return res.send(assignment);
		})
	}
}
	