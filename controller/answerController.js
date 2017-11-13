const Answer = require('../models/answer');

module.exports = {
    create(req, res) {
        const answerProp = req.body;
        answerProp.created_date = new Date().toISOString();
        Answer.create(answerProp)
            .then((answer) => {
				answer.populate('author', function (err) {
					res.send({err: 0, msg: 'Answer Saved successfully',answer});
					});
            });
    },

    update(req,res) {
        const updateObj = req.body;
        var id = updateObj._id;
        updateObj.updated_date = new Date().toISOString();
        Answer.findByIdAndUpdate(id, updateObj, {new: true})
            .then((answer) =>{
                res.send({err: 0, msg: 'Answer Updated successfully',answer});
            })
    },

    getAnswerById(req,res){
        let id = req.query.id;
        Answer.findById(id)
            .populate('author')
            .then((answer)=>{
                res.send({data: answer, msg: 'Answer', err: 0})
            })
    }
};