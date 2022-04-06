const { Schema, model } = require("mongoose");
const encryption = require("mongoose-encryption");
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
    },
    picture: String,
    dateCreated: {
        type: String,
        required: true
    },
    passRecoveryID: String,
    google: String
});

userSchema.plugin(encryption, {secret: process.env.USERS, excludeFromEncryption: ['_id', 'email']})

const User = new model('User', userSchema);

module.exports = User;