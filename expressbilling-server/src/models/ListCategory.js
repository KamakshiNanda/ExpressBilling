const mongoose = require('mongoose');

const listCategorySchema = new mongoose.Schema({
    title:
    {
        type: String,
        required: true
    },
    image:
    {
        type: String,
        required: true
    },
});

mongoose.model('ListCategory',listCategorySchema);