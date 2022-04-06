const { Schema, model } = require("mongoose");

const faqSchema = new Schema({
    question: {
        type: String,
        required: [true, "FAQ question is required for FAQ creation"]
    },
    answer: {
        type: String,
        required: [true, "FAQ answer is required for FAQ creation"]
    },
    category: {
        type: String,
        required: true,
        default: "General"
    }
});

const FAQ = new model('FAQ', faqSchema);

module.exports = FAQ;