const { Schema, model } = require("mongoose");
require("dotenv").config();

const userSchema = new Schema({
    _id: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    pass: {
        type: String,
        required: true
    }
});

const User = new model('User', userSchema);

module.exports = User;