const Question = require('../models/question');
const Tag = require('../models/tag');

module.exports = {
    greeting(req, res) {
        res.send({msg: "Server is up and running"});
    },

    create(req, res) {
        const questionProp = req.body;
        questionProp.created_date = new Date().toISOString();
        Question.create(questionProp)
        .then((question) => {
            let tagIds = question.tags;
            Tag.update({_id: {"$in": tagIds}}, {$inc: {count: 1}}, {multi: true})
            .then((tags) => {
                res.send({err: 0, msg: 'Question saved successfully'})
            })
        });
    },

    update(req, res) {
        const updateObj = req.body;
	    const id = updateObj._id;
        updateObj.updated_date = new Date().toISOString();
        Question.findByIdAndUpdate(id, updateObj, {new: true})
        .then((updatedQuestion) => {
            res.send({err: 0, msg: 'Question saved successfully', updatedQuestion})
        })
    },

    getQuestions(req, res) {
        Question.find({})
        .populate('tags')
        .populate('author')
        .populate('answers')
        .then((questions) => {
            res.send({data: questions, msg: 'All Questions', err: 0})
        })
    },

    getQuestionById(req, res) {
        let id = req.query.id;
        Question.findById(id)
        .populate('tags')
        .populate({
            path: 'answers',
            populate: [{
                path: 'author',
                model: 'user'
            },{
				path: 'comments',
				populate: {
					path: 'author',
					model: 'user'
				}
            }]
        })
        .populate('author')
        .populate({
            path: 'comments',
            populate: {
                path: 'author',
                model: 'user'
            }
        })
        .then((question) => {
            res.send({data: question, msg: 'Populated Questions', err: 0})
        })
    }
};