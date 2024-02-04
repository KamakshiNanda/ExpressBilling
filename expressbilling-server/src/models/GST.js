const mongoose = require('mongoose');

const Double = require('@mongoosejs/double');

const GSTSchema = new mongoose.Schema({
    title:
    {
        type: String,
        required: true
    },
    cgst:
    {
        type: Double,
        required: true
    },
    sgst:
    {
        type: Double,
        required: true
    },
});

mongoose.model('GST',GSTSchema);