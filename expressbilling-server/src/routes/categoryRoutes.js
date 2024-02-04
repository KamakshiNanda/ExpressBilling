const express = require('express');
const mongoose = require('mongoose');

const Category = mongoose.model('Category');
const router = express.Router();

//router.use(requireAuth);

router.get('/categories', async(req,res)=>{
    try
    {
        console.log('request for categories.');
        var category= await Category.find({},{title:1});
        res.send(category);
    }
    catch(err){
        console.log(err);
        res.status(500).send('Something went wrong. Please try again later.')
    }
});

router.get('/sub-categories/:id', async(req,res)=>{
    try{
        console.log(req.params)
        var subCategory= await Category.findOne({_id:req.params.id},{_id:0,subCategories:1});
        res.send(subCategory.subCategories);
    }
    catch(err){
        console.log(err);
        res.status(500).send('Something went wrong. Please try again later.')
    }
})

router.post('/categories', async(req,res)=>{
    console.log(req.body);
    try{
        const category = new Category();
        category.title= req.body.title;
        category.gst= req.body.gst;
        category.discount= req.body.discount;
        category.save();
        res.send("Form submitted");
    }catch(err){
        console.log("Error in adding new category",err)
        res.send("unable to add category.");
    }
    
 }
);

router.get('/category/title/:id', async(req,res)=>{
    console.log(req.body);
    try{
        console.log('request for category.');
        var category= await Category.findOne({_id:req.params.id},{title:1,_id:0});
        console.log(category)
        res.send(category.title);
    }catch(err){
        console.log("Error white fething category.",err)
        res.send("Title not found.");
    }
    
 }
);

router.post('/sub-categories',async(req,res)=>{
    console.log(req.body);
    try{
        await Category.updateOne(
            {_id: req.body.category},
            {
                $addToSet:{
                    subCategories: req.body.subCategory,
                }
            }
        )
        //var subCategories = await Category.find({_id: req.body.category}).subCategories;
       // console.log(subCategories)
        res.send("sub-category added.")
    }
    catch(err){
        console.log("Error in adding sub-category",err)
        res.send("unable to connect to the server.");
    }
})

module.exports= router;