const express = require('express');
const mongoose = require('mongoose');
const requireAuth = require('../middlewares/requireAuth');
const ListCategory = mongoose.model('ListCategory');
const List = mongoose.model('List');
const Item = mongoose.model('Item');

const router = express.Router();

router.use(requireAuth);

router.post('/expressbilling/apis/listCategory', async (req, res) => {
    console.log(req.body);
    try {
        const category = new ListCategory();
        category.title = req.body.title;
        category.image = req.body.image;
        await category.save();
        res.send('Category addedd.');
    }
    catch (err) {
        console.log('error while adding listCtageory', err);
        res.status(402).send('Invalid Input');
    }
});

router.post('/expressbilling/apis/list', async (req, res) => {
    try {
        console.log('name:', req.body.name, 'category:', req.body.category);
        console.log('user:', req.user.name);
        const list = new List();
        list.name = req.body.name;
        const category = await ListCategory.findOne({ title: req.body.category }, { _id: true });
        if (!category) {
            res.status(400).send('Bad request.');
            return;
        }
        list.category = category;
        list.userId = req.user._id;
        var d = new Date();
        list.createDate = d;
        await list.save();

        var lists = await List.find({ userId: req.user._id });
        for (var i in lists) {
            var cat = await ListCategory.findById(lists[i].category);
            lists[i].category = cat;
        }
        console.log('after adding new list lists are', lists);
        res.send(lists);
    }
    catch (err) {
        console.log('error while adding list');
        res.send('Something went wrong.');
    }
});

router.post('/expressbilling/apis/list/item', async (req, res) => {
    try {
        console.log('id:', req.body.id, 'BN:', req.body.barcodeNumber, "quantity:", req.body.quantity);
        console.log('user:', req.user.name);
        var listItem = await Item.findOne({ barcodeNumber: req.body.barcodeNumber }, { stock: 1, maxLimit: 1 });
        console.log("listItem:", listItem);
        if (listItem.stock >= req.body.quantity && listItem.maxLimit >= req.body.quantity) {
            console.log('inside if')
            var list = await List.findById(req.body.id, { items: 1 });
            var cancel = 0;
            for (var i in list.items) {
                if (list.items[i].barcodeNumber == req.body.barcodeNumber)
                    {
                        cancel = 1;
                        var limit;
                        listItem.maxLimit < listItem.stock ? limit = listItem.maxLimit : limit = listItem.stock;
                        console.log('limit:',limit);
                        var quantity = parseInt(list.items[i].quantity) + parseInt(req.body.quantity) ;
                        if(quantity <= limit)
                            {
                                list.items[i].quantity = quantity;
                                console.log('quantity:',quantity);
                                await List.updateOne({ _id: req.body.id },
                                    {
                                        $set: {
                                            "items": list.items
                                        }
                                    });
                            }
                    }
            }
            if (!cancel) {
                await List.updateOne({ _id: req.body.id },
                    {
                        $addToSet: {
                            "items": { barcodeNumber: req.body.barcodeNumber, quantity: req.body.quantity },
                        }
                    });
            }
        }
        const listItems = await List.findById(req.body.id);
        var items = [];
        for (var i in listItems.items) {
            //console.log(listItems.items[i]);
            var item = await Item.findOne({ barcodeNumber: listItems.items[i].barcodeNumber });
            items.push({ ...item._doc, quantity: listItems.items[i].quantity, selected: false });
        }
        console.log(items)
        res.send(items);
    }
    catch (err) {
        console.log('error while adding list', err);
        res.send('Something went wrong.');
    }
});

router.post('/expressbilling/apis/list/item/no-response', async (req, res) => {
    try {
        var text;
        console.log('id:', req.body.id, 'BN:', req.body.barcodeNumber, "quantity:", req.body.quantity);
        console.log('user:', req.user.name);
        var listItem = await Item.findOne({ barcodeNumber: req.body.barcodeNumber }, { stock: 1, maxLimit: 1 });
        console.log("listItem:", listItem);
        if (listItem.stock >= req.body.quantity && listItem.maxLimit >= req.body.quantity) {
            //console.log('inside if')
            var list = await List.findById(req.body.id, { items: 1 });
            var cancel = 0;
            for (var i in list.items) {
                if (list.items[i].barcodeNumber == req.body.barcodeNumber)
                    {
                        cancel = 1;
                        var limit;
                        listItem.maxLimit < listItem.stock ? limit = listItem.maxLimit : limit = listItem.stock;
                        console.log('limit:',limit);
                        var quantity = parseInt(list.items[i].quantity) + parseInt(req.body.quantity) ;
                        if(quantity <= limit)
                            {
                                list.items[i].quantity = quantity;
                                console.log('quantity:',quantity);
                                await List.updateOne({ _id: req.body.id },
                                    {
                                        $set: {
                                            "items": list.items
                                        }
                                    });
                                text='Quantity for the item updated ';
                            }
                        else{
                            text='The quantity of the item is exceeding its max purchase limit ';
                        }
                    }
            }
            if (!cancel) {
                await List.updateOne({ _id: req.body.id },
                    {
                        $addToSet: {
                            "items": { barcodeNumber: req.body.barcodeNumber, quantity: req.body.quantity },
                        }
                    });
                text='Item added successfully ';
            }
        }
        else
        {
        }
        console.log(text);
        res.send(text);
    }
    catch (err) {
        console.log('error while adding list', err);
        res.send('Something went wrong.');
    }
});


router.get('/expressbilling/apis/list/items', async (req, res) => {
    console.log(req.query.id);
    console.log('id:', req.query.id);
    try {
        const list = await List.findById(req.query.id);
        console.log("list:",list);
        var items = [];
        for (var i in list.items) {
            console.log(list.items[i]);
            var item = await Item.findOne({ barcodeNumber: list.items[i].barcodeNumber });
            items.push({ ...item._doc, quantity: list.items[i].quantity, selected: false  });
        }
        console.log(items);
        res.send(items);
    }
    catch (err) {
        console.log('Could not find items of the list.', err);
        res.send(400).send('Bad Request');
    }
});

router.get('/expressbilling/apis/lists', async (req, res) => {
    try {
        var list = await List.find({ userId: req.user._id });
        //var lists = [];
        for (var i in list) {
            console.log(list[i]);
            var category = await ListCategory.findById(list[i].category);
            console.log("title:", category.title);
            list[i].category = category;
            //lists.push({ ...list[i]._doc, categoryTitle: category.title, image: category.image });
        }
        res.send(list);
    }
    catch (err) {
        console.log('Could not find items of the list.', err);
        res.send(502).send('Something went wrong.');
    }
});

router.post('/expressbilling/apis/list-delete', async (req, res) => {
    try {
        console.log('req id',req.body);
        await List.deleteOne({ _id: req.body.id });
        var list = await List.find({ userId: req.user._id });
        for (var i in list) {
            //console.log(list[i]);
            var category = await ListCategory.findById(list[i].category);
            console.log("title:", category.title);
            list[i].category = category;
        }
        console.log('after deleting lists are', list);
        res.send(list);
    }
    catch (err) {
        console.log('Error while deleting list.');
        res.status(400).send('Bad request');
    }
});

router.delete('/expressbilling/apis/list/item', async (req, res) => {
    console.log('barcodeNumber:', req.query.barcodeNumber);
    console.log('listId:', req.query.id);
    try {
        const list = await List.findById(req.query.id);
        var index;
        for (var i in list.items) {
            if (list.items[i].barcodeNumber == req.query.barcodeNumber)
                index = i;
        }
        console.log(index);
        list.items.splice(index, 1);
        await List.updateOne({ _id: req.query.id },
            {
                $set: {
                    items: list.items
                }
            });
        const listItems = await List.findById(req.query.id);
        var items = [];
        for (var i in listItems.items) {
            console.log(listItems.items[i]);
            var item = await Item.findOne({ barcodeNumber: listItems.items[i].barcodeNumber });
            items.push({ ...item._doc, quantity: listItems.items[i].quantity, selected: false  });
        }
        res.send(items);
    }
    catch (err) {
        console.log('Could not find items of the list.', err);
        res.send(502).send('Something went wrong.');
    }
});

router.put('/expressbilling/apis/list/item/quantity', async (req, res) => {
    try {
        console.log('id:', req.body.id, 'barcodeNumber:', req.body.barcodeNumber, "quantity", req.body.quantity);
        var list = await List.findById(req.body.id);
        for (var i in list.items) {
            if (list.items[i].barcodeNumber == req.body.barcodeNumber)
                list.items[i].quantity = req.body.quantity;
        }
        await List.updateOne({ _id: req.body.id },
            {
                $set: {
                    items: list.items
                }
            });
        const listItems = await List.findById(req.body.id);
        var items = [];
        for (var i in listItems.items) {
            console.log(listItems.items[i]);
            var item = await Item.findOne({ barcodeNumber: listItems.items[i].barcodeNumber });
            items.push({ ...item._doc, quantity: listItems.items[i].quantity, selected: false  });
        }
        res.send(items);
    }
    catch (err) {
        console.log(err);
        res.status(400).send('Cannot modify quantity.');
    }
});

module.exports = router;