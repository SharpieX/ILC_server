const User = require('../models/user');

module.exports = {
    create(req, res) {
        const userObj = req.body;
        let newUser = {
            provider: userObj.provider,
            id: userObj.uuid,
            imageUrl: userObj.profileImg,
            name: userObj.displayName
        }

        let find_obj = {id: newUser.id};
        let options = { upsert: true, new: true};

        console.log(newUser);
        User.findOneAndUpdate(find_obj, newUser, options)
            .then((savedUser) => {
                if (savedUser) {
                    res.send({err: 0, msg: 'User saved successfully', data: savedUser});
                }
            })
            .catch((error)=>{
               console.log(error);
            })

    },


    getUsers(req, res) {
        User.find({})
            .then((users) => {
                res.send({data: users, msg: 'All users', err: 0})
            })
    },

    getUserById(req, res) {
        let id = req.query.id;
        User.findById(id)
            .then((user) => {
                res.send({data: user, msg: 'User', err: 0})
            })
    }
};