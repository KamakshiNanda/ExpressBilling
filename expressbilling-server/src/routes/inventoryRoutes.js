const express = require('express');
const formidable = require('formidable')
const mongoose = require('mongoose');
const Item = mongoose.model('Item');
const Category = mongoose.model('Category');
const fs = require('fs');
const requireAuth = require('../middlewares/requireAuth');

const router = express.Router();
//router.use(requireAuth);

router.post('/items', async (req, res) => {
  console.log("got a request", req.body);
  try {
    if (!req.body.barcodenumber) {
      var form = new formidable.IncomingForm();
      form.parse(req, async (err, fields, files) => {
        if (err) {
          console.error('Error', err)
          throw err
        }
        console.log('Field title:', fields)
        console.log('File path:', files.image.path)
        console.log('File type:', files.image.type)
        const file = fs.readFileSync(files.image.path);
        const type = files.image.type;
        const item = new Item();
        item.image.data = file;
        item.image.contentType = type;
        item.barcodeNumber = fields.bNumber;
        item.company = fields.company;
        item.particulars = fields.title;
        item.size.value = fields.size;
        item.size.unit = fields.unit;
        item.price = fields.price;
        item.discount = fields.discount;
        item.supplier = fields.supplier;
        item.stock = fields.stock;
        item.maxLimit = fields.maxLimit;
        //category static
        var categoryCount = 1;
        for (var i = 0; i < categoryCount; i++) {
          item.categories[i] = new Object();
          item.categories[i].cat_id = fields.category1;
          item.categories[i].subCategory = fields.subCategory1;
        }
        if (fields.referenced == 'true') {
          try {
            console.log("referenced true")
            var reference = await Item.findOne({ barcodeNumber: fields.reference });
            if (reference.refenced) {
              console.log('Cannot reference an already referenced product.')
              response.send('Cannot refernce an already refernced product.');
            }
            item.reference.referenced = true;
            item.reference.reference = fields.reference;
            await Item.updateOne({ barcodeNumber: fields.reference },
              {
                $addToSet: {
                  "reference.references": fields.bNumber,
                }
              });
          }
          catch (err) {
            console.log("Error finding the refernce.")
            response.status(400).send('Cannot find the given refernce for this item.');
          }
        }
        else {
          item.reference.referenced = false;
        }
        console.log('item before submittion is:', item);
        item.save();
      });
    }
  } catch (err) {
    console.log('error:', err);
    res.status(400).send("Something went wrong.");
  }
  //console.log("outside the function",req.body.name);
  res.send('form successfully submitted.');
});

router.put('/items/category', async (req, res) => {
  console.log(req.body);
  try {
    await Item.updateOne(
      { barcodeNumber: req.body.item },
      {
        $set: {
          categories: [{ cat_id: req.body.category, subCategory: req.body.subCategory }],
        }
      }
    )
    //var subCategories = await Category.find({_id: req.body.category}).subCategories;
    // console.log(subCategories)
    res.send("category updated.")
  }
  catch (err) {
    console.log("Error in updating category", err)
    res.status(400).send("Bad Request.");
  }
});

router.get('/items/sub-category/:categoryId/:subCategory', async (req, res) => {
  try {
    var items = await Item.find({ 'categories.cat_id': req.params.categoryId, 'categories.subCategory': req.params.subCategory });
    //console.log(items);
    console.log("catid=", req.params.categoryId);
    console.log("sub cat=", req.params.subCategory);
    res.send(items);
  }
  catch (err) {
    res.status(400).send('Cannot find items');
  }
});

router.get("/items/references/:barcode", async (req, res) => {
  try {
    var items = [];
    var ref = await Item.findOne({ barcodeNumber: req.params.barcode }, { _id: false, reference: true });
    console.log(ref);
    if (ref.reference.referenced == false) {
      if (ref.reference.references.length > 0) {
        for (i = 0; i < ref.reference.references.length; i++) {
          var item = new Item();
          item = await Item.findOne({ barcodeNumber: ref.reference.references[i] });
          items.push(item);
        }
        console.log("items:", items);
      }
      res.send(items);
    }
    else {
      var reference = await Item.findOne({ barcodeNumber: ref.reference.reference });
      items.push(reference);
      if (reference.reference.references.length > 0) {
        for (i = 0; i < reference.reference.references.length; i++) {
          var item = new Item();
          if (reference.reference.references[i] != req.params.barcode) {
            item = await Item.findOne({ barcodeNumber: reference.reference.references[i] });
            items.push(item);
          }
        }
        console.log("items:", items);
      }
      res.send(items);
    }
  }
  catch (err) {
    res.status(400).status('Cannot find item.')
  }
});

router.get('/items', async (req, res) => {
  try {
    var items = await Item.find({});
    //console.log(items);
    res.send(items);
  }
  catch (err) {
    res.status(500).send('Something went wrong, please try again later.');
  }
});

router.get('/items/:barcode', async (req, res) => {
  try {
    var item = await Item.findOne({ barcodeNumber: req.params.barcode });
    console.log(item);
    res.send(item);
  }
  catch (err) {
    res.status(400).status('Cannot find item.')
  }

});

router.get('/expressbilling/apis/items/top-selling', async (req, res) => {
  try {
    console.log("Got request for top items.")
    var item = await Item.find({}).sort({'sales':-1}).limit(10);
    for(var i=0;i<item.length;i++)
    {
      var cat= await Category.findOne({_id: item[i].categories[0].cat_id},{title:1,_id:0});
      item[i]={_id: item[i]._id,image: item[i].image,barcodeNumber: item[i].barcodeNumber,company: item[i].company,particulars: item[i].particulars,
        price: item[i].price, size: item[i].size,discount: item[i].discount, stock: item[i].stock, maxLimit: item[i].maxLimit ,categories: item[i].categories,
        reference: item[i].reference, sales: item[i].sales ,categoryTitle: cat.title}
    }
    console.log(item);
    res.send(item);
  }
  catch (err) {
    res.status(502).status('Could not find items.')
  }
});

router.post('/expressbilling/apis/items/images', async (req, res) => {
  try {
    console.log(req.body.items);
    var items = req.body.items;
    var arr=[];
    for(var i in items)
    {
      var item = await Item.findOne({ barcodeNumber: items[i].barcodeNumber },{image:1, stock:1, maxLimit:1 });
      arr.push({...item._doc,...items[i]})
    }
    console.log(arr);
    res.send(arr);
  }
  catch (err) {
    res.status(400).status('Cannot find item.')
  }

});

/*router.post('/items/update', async (req, res) => {
  console.log("got the request");
  try {
    await Item.updateMany(
      { },
      {
        $set: {
          sales: 10
        }
      }
    )
    //var subCategories = await Category.find({_id: req.body.category}).subCategories;
    // console.log(subCategories)
    res.send("category updated.")
  }
  catch (err) {
    console.log("Error in updating category", err)
    res.status(400).send("Bad Request.");
  }
});
*/
module.exports = router;