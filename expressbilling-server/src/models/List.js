const mongoose = require('mongoose');
var Schema = mongoose.Schema,
ObjectId = Schema.ObjectId;

const listSchema = new mongoose.Schema({
    userId:{
        type: ObjectId,
        ref: 'User',
        required: true,
        maxLength: 30
    },
    name: {
        type: String,
        required: true,
    },
    category:{
        type: ObjectId,
        ref: 'ListCategory',
        required: true
    },
    items:[
        {
            barcodeNumber:{
                type: Number
            },
            quantity:{
                type: Number
            }
        }
    ],
    createDate:
    {
        type: Date
    }
});

mongoose.model('List',listSchema);