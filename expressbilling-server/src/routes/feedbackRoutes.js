const express = require('express');
const mongoose = require('mongoose');
const requireAuth = require('../middlewares/requireAuth');
const Feedback = mongoose.model('Feedback');
const router = express.Router();

router.use(requireAuth);

router.post('/expressbilling/apis/feedback', async(req,res)=>{
    try{
    console.log(req.body);

    const feedback = new Feedback();
    feedback.user = req.user._id;
    feedback.rating = req.body.rating;
    feedback.content = req.body.content;
    feedback.type = req.body.type;
    var d = new Date();
    feedback.createDate = d;
    feedback.save();
    res.send("Feedback successfully submitted.");
    }catch(err)
    {
        console.log('error while submitting feedback.');
        res.status(402).send('Something went wrong.');
    }
 }
);

module.exports= router;