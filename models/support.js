const { Schema, model } = require("mongoose");
const { v4:uuidv4 } = require("uuid");

const supportSchema = new Schema({
    name: {
        type: String,
        required: [true, "Name is required for new support question creation"]
    },
    email: {
        type: String,
        required: [true, "Email is required for new support question creation"]
    },
    message: {
        type: String,
        required: [true, "Message is required for new support question creation"]
    },
    status: {
        type: String,
        required: true,
        default: 'Unsolved'
    }
});

const Support = new model('Support', supportSchema);

module.exports = Support;