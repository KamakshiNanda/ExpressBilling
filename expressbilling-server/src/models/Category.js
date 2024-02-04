const mongoose = require('mongoose');
var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;
const Double = require('@mongoosejs/double');

const categorySchema = new mongoose.Schema({
    title:
    {
        type: String,
        required: true,
        unique: true
    },
    subCategories:
    [
        {
            type: String
        }
    ],
    gst:{
        type: ObjectId
    },
    discount:
    {
        type: Double
    }
});

mongoose.model('Category',categorySchema);