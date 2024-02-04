const mongoose = require('mongoose');
var Schema = mongoose.Schema,
ObjectId = Schema.ObjectId;
const Double = require('@mongoosejs/double');

const orderSchema = new mongoose.Schema({
    userId:{
        type: ObjectId,
        ref: 'User',
        required: true,
        maxLength: 30
    },
    items:[
        {
            barcodeNumber:{
                type: Number
            },
            quantity:{
                type: Number
            },
            price:{
                type: Double
            },
            rate:{
                type: Double
            },
            title:{
                type: String
            }
        }
    ],
    createDate:
    {
        type: Date
    },
    total:{
        type: Double,
        required: true
    },
    savings:{
        type: Double,
        required: true
    },
    paymentStatus:{
        type: Boolean,
        required: true
    },
    paymentMode: {
        type: String,
        required: false
    }
});

mongoose.model('Order',orderSchema);