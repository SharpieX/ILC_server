const Comment = require('../models/comment');

module.exports = {
	create(req, res) {
		const commentObj = req.body;
		commentObj.created_date = new Date().toISOString();
		Comment.create(commentObj)
		.then((comment) => {
			comment.populate('author', function (err) {
				if (!err) {
					res.send({err: 0, msg: 'Comment saved successfully', data: comment});
				}
			});

		});
	}
};