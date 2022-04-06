const { Schema, model } = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const adminSchema = new Schema({
    _id: {
        type: String,
        required: [true, "Admin ID is required for new admin creation"],
        default: uuidv4()
    },
    user: {
        type: String,
        required: [true, "Admin username is required for new admin creation"]
    },
    pass: {
        type: String,
        required: [true, "Admin password is required for new admin creation"]
    }
});

const Admin = new model('Admin', adminSchema);

module.exports = Admin;