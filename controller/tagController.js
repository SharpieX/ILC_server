const Tag = require('../models/tag');

module.exports = {
    create(req, res) {
        const tagProp = req.body;
        Tag.create(tagProp)
            .then((tag) => {
                res.send(tag);
            });
    },

    getTags(req, res) {
        Tag.find({})
            .then((tags) => {
                res.send({data: tags, msg: 'All tags', err: 0})
            })
    },

   /* searchTagsByName(req, res) {
        let find_val = req.body.where.name.$regex;
        let find_obj = {'name': new RegExp(find_val, 'i')};
        Tag.find(find_obj)
            .then((tags) => {
                res.send({data: tags, msg: 'Matched with String', err: 0})
            });
    }*/

	searchTagsByName(req ,res){
		let find_val = req.body;
		Tag.find(find_val)
		.then((tags) => {
			res.send({data: tags, msg: 'All tags', err: 0})
		})
    }
};