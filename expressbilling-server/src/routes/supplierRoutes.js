const express = require('express');
const mongoose = require('mongoose');

const Supplier = mongoose.model('Supplier');
const router = express.Router();

router.post('/suppliers', async(req,res)=>{
    console.log(req.body);

    const supplier = new Supplier();
    supplier.name= req.body.name;
    supplier.postalAddress.country= req.body.country;
    supplier.postalAddress.state= req.body.state;
    supplier.postalAddress.city= req.body.city;
    supplier.postalAddress.locality= req.body.locality;
    supplier.postalAddress.hNumber= req.body.house;
    supplier.postalAddress.pincode= req.body.pincode;
    supplier.mobileNumber= req.body.mobNo;
    supplier.email= req.body.email;
    supplier.save();

    res.send("Form submitted");
 }
);

module.exports= router;