const express = require('express');
const mongoose = require('mongoose');

const GST = mongoose.model('GST');
const router = express.Router();

router.post('/gst', async(req,res)=>{
    console.log(req.body);

    const gst = new GST();
    gst.title= req.body.title;
    gst.cgst= req.body.cgst;
    gst.sgst= req.body.sgst;
    gst.save();

    res.send("Form submitted");
 }
);

module.exports= router;