const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    provider:String,
    id:String,
    imageUrl:String,
    name: {
        type: String,
        validate: {
            validator: (name) => name.length > 2,
            message: 'Name Must be longer than 2'
        },
        required: [true, "Name is required"]
    },
    email: {type: String, unique: true, required: true}
});


module.exports = mongoose.model('user', userSchema);