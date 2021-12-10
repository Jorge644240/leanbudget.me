const { Schema, model } = require("mongoose");
const encryption = require("mongoose-encryption");
require("dotenv").config();

const budgetSchema = new Schema({
    userID: {
        type: String,
        required: true
    },
    balance: {
        type: Number,
        required: true,
        default: 0
    },
    movements: {
        type: [{
            movement: {
                type: String,
                required: true
            },
            amount: {
                type: Number,
                required: true
            },
            date: {
                type: String,
                required: true
            }
        }],
        required: true,
        default: []
    }
});

budgetSchema.plugin(encryption, {secret: process.env.USERS, excludeFromEncryption: ['userID']});

const Budget = new model('Budget', budgetSchema);

module.exports = Budget;