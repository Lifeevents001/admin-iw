const mongoose = require('mongoose');

const successStorySchema = new mongoose.Schema({
    photo: {
        type: String,
        required: true
    },
    coupleName: {
        type: String,
        required: true,
        trim: true
    },
    comment: {
        type: String,
        required: true,
        trim: true
    },
    date: {
        type: Date,
        default: Date.now // Automatically sets today's date
    }
});

const SuccessStory = mongoose.model('SuccessStory', successStorySchema);

module.exports = SuccessStory;
