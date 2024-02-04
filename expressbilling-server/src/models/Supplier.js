const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
    name:
    {
        type: String,
        required: true
    },
    postalAddress:
    {
            hNumber:{
                type: String
            },
            locality:
            {
                type: String
            },
            city:
            {
                type: String
            },
            state:
            {
                type: String
            },
            country:
            {
                type: String
            },
            pincode:
            {
                type: String,
                minLength: 6,
                maxLength: 6
            }
    },
    mobileNumber:{
        type: String,
        required: true,
        minLength: 10,
        maxLength: 10
    },
    email:{
        type: String
    }
});

mongoose.model('Supplier',supplierSchema);