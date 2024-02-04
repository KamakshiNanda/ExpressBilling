const mongoose = require('mongoose');
var Schema = mongoose.Schema,
ObjectId = Schema.ObjectId;

const FeedbackSchema = new mongoose.Schema({
    user:
    {
        type: ObjectId,
        ref: 'User'
    },
    rating:
    {
        type: Number,
        required: true,
        maximum: 5
    },
    content:
    {
        type: String,
        required: true
    },
    type:
    {
        type: String,
        pattern: "^(Suggestion|General\sFeedback)$",
        required: true
    },
    createDate:
    {
        type: Date
    },
});

mongoose.model('Feedback',FeedbackSchema);