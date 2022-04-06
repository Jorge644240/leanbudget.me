const { Schema, model } = require("mongoose");

const learningSchema = new Schema({
    id: {
        type: String,
        required: [true, "Learning video ID is required for new learning video creation"]
    },
    title: {
        type: String,
        required: [true, "Learning video title is required for new learning video creation"]
    },
    description: {
        type: String,
        required: [true, "Learning video description is required for new learning video creation"]
    },
    video: {
        type: String,
        required: [true, "Learning video URL is required for new learning video creation"]
    }
});

const Learning = new model('Learning', learningSchema);

module.exports = Learning;