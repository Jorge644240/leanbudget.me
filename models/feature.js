const { Schema, model } = require("mongoose");

const featureSchema = new Schema({
    id: {
        type: String,
        required: [true, "Feature ID is required for new feature creation"]
    },
    title: {
        type: String,
        required: [true, "Feature title is required for new feature creation"]
    },
    icon: {
        type: String,
        required: [true, "Feature icon class is required for new feature creation"]
    },
    description: {
        type: String,
        required: [true, "Feature description is required for new feature creation"]
    }
});

const Feature = new model('Feature', featureSchema);

module.exports = Feature;