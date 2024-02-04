const mongoose = require('mongoose');

const userImageSchema = new mongoose.Schema({
    image:
    {
        type: String,
        required: true
    },
});

mongoose.model('UserImage',userImageSchema);