const User = require('../models/user');

module.exports = {
    create(req, res) {
        const userObj = req.body;
        let newUser = {
            provider: userObj.provider,
            id: userObj.uuid,
            imageUrl: userObj.profileImg,
            name: userObj.displayName,
            email:userObj.email
        }

        User.create(newUser)
            .then((userSaved)=>{
                res.send({err: 0, msg: 'User saved successfully', data: userSaved});
            })
            .catch((error)=>{
                console.log(error);
            });
    },


    getUsers(req, res) {
        User.find({})
            .then((users) => {
                res.send({data: users, msg: 'All users', err: 0})
            })
    },

    getUserByUUID(req, res){
        let id = req.query.id;
        let find_obj = {id:id};
        User.findOne(find_obj)
            .then((savedUser) => {
                if (savedUser !== null) {
                    res.send({data: savedUser, msg: 'Authentication Successful', err: 0})
                } else {
                    res.send({data: savedUser, msg: 'Authentication Failed ', err: 2})
                }
            });
    },

    getUserById(req, res) {
        let id = req.query.id;
        User.findById(id)
            .then((user) => {
                res.send({data: user, msg: 'User', err: 0})
            })
    }
};