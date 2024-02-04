const express = require('express');
const formidable = require('formidable')
const mongoose = require('mongoose');
const fs= require('fs');
const Demo = mongoose.model('Demo');
const Item = mongoose.model('Item');

const router = express.Router();

router.post('/demo', async (req,res)=>{
    console.log("got a request",req.body);
    var form = new formidable.IncomingForm();

    form.parse(req, async (err, fields, files) => {
        if (err) {
          console.error('Error', err)
          throw err
        }
        console.log('Field name:', fields.name)
        console.log('File path:', files.file.path)
        console.log('File type:', files.file.type)
        const name=fields.name ;
        const file=fs.readFileSync(files.file.path) ;
        const type=files.file.type;
        const demo=new Demo();
        demo.image.data=file;
        demo.image.contentType=type;
        demo.name=name;
        await demo.save();
      })
      //console.log("outside the function",req.body.name);
      res.send('hey there');
});

router.get('/demo', async(req,res)=>{
    const name='Akshi';
    const demo = await Item.findOne({price:175});
    console.log(demo.image.data);
    console.log(demo.image.contentType);
    const src=demo.image.data.toString('base64');
    console.log(src);
    const type=demo.image.contentType;
    if(!demo){
        return res.status(422).send({ error: 'Invalid email or password.'});
    }
    try{
        res.send(`<img src='data:${type};base64,${src}' alt='image'/>`);
    }catch (err){
        return res.status(422).send({error: 'Invalid email or password.'});
    }
});

module.exports= router;