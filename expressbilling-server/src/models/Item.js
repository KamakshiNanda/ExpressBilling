const mongoose = require('mongoose');
var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;
const Double = require('@mongoosejs/double');

const itemSchema = new mongoose.Schema({
    barcodeNumber: {
        type: Number,
        required: true,
        unique: true
    },
    company:{
        type: String
    },
    size:{
        value:{
            type: Number
        },
        unit: String
    },
    particulars:{
        type: String,
        required: true
    },
    image: {
        data: Buffer,
        contentType: String
    },
    price: {
        type: Double,
        required: true
    },
    discount: {
        type: Double
    },
    supplier: {
        type: ObjectId
    },
    categories:[
        {
            cat_id:{
                type: ObjectId,
                ref: 'Category'
            },
            subCategory:{
                type: String
            }
        }
    ],
    stock: {
        type: Number
    },
    sales: {
        type: Number
    },
    maxLimit:{
        type: Number
    },
    reference:{
        referenced: Boolean,
        reference: {type: String},
        references: [
            {
                type: Number,
                required: false
            }
        ]
    }
});

mongoose.model('Item',itemSchema);