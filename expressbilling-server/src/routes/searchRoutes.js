const express = require('express');
const mongoose = require('mongoose');
const Item = mongoose.model('Item');
const Category = mongoose.model('Category');
const requireAuth = require('../middlewares/requireAuth');
const synonyms = require('synonyms');

const router = express.Router();
router.use(requireAuth);

function existsString(item, arr) {
    //console.log("arr:", arr, "item", item);
    for (var i = 0; i < arr.length; i++) {
        if (arr[i].item.toLowerCase() == item.toLowerCase()) {
            return true;
        }
    }
    return false;
}

function exists(item, arr) {
    //console.log("in exists arr:", arr, "item", item);
    for (var i = 0; i < arr.length; i++) {
        if (arr[i].title == 'item' && typeof (item) != 'object') {
            if (arr[i].item.barcodeNumber == item) {
                return true;
            }
        }
        else if (arr[i].title == 'category' && typeof (item) != 'object') {
            if (arr[i].category == item) {
                return true;
            }
        }
        else if (arr[i].title == 'subCategory' && typeof (item) == 'object') {
            if (arr[i].subCategory == item.subCategory && arr[i].categoryID.toString() == item.categoryID.toString()) {
                return true;
            }
        }
    }
    return false;
}

function existsWord(item, arr) {
    //console.log("arr:", arr, "item", item);
    for (var i = 0; i < arr.length; i++) {
        if (arr[i].toLowerCase() == item.toLowerCase()) {
            return true;
        }
    }
    return false;
}

async function getResults(term) {
    var arr = [];
    console.log('term in getResults:', term)
    var index = 0, regex;
    var regExpressions = [new RegExp('^' + term, "i"), new RegExp('\\b' + term, "i"), new RegExp(term, 'i')];
    var part = term.split(" ");
    console.log('part:', part)
    console.log('regular expressions:', regExpressions)
    if (part.length > 1) {
        for (var i = 0; i < part.length; i++)
            regExpressions = regExpressions.concat([new RegExp('^' + part[i], "i"), new RegExp('\\b' + part[i], "i"), new RegExp(part[i], 'i')]);
        console.log('regular expressions:', regExpressions)
    }
    while (arr.length < 20 && index < regExpressions.length) {
        console.log('index:', index, "part index:", parseInt(index / 3) - 1);
        regex = regExpressions[index];
        //var items = await Item.find({ particulars: regex }, { barcodeNumber: 1, categories: 1 });
        var items = await Item.find({ particulars: regex });
        for (var i = 0; i < items.length && arr.length < 20; i++) {
            if (!exists(items[i].barcodeNumber, arr)) {
                var cat= await Category.findOne({_id: items[i].categories[0].cat_id},{title:1,_id:0});
                arr.push({ item: items[i], title: 'item',categoryTitle: cat.title });
            }
        }

        if (arr.length < 20) {
            //items = await Item.find({ company: regex }, { barcodeNumber: 1, categories: 1 });
            items = await Item.find({ company: regex });
            for (var i = 0; i < items.length && arr.length < 20; i++) {
                if (!exists(items[i].barcodeNumber, arr)) {
                    var cat= await Category.findOne({_id: items[i].categories[0].cat_id},{title:1,_id:0});
                    arr.push({ item: items[i], title: 'item', categoryTitle: cat.title });
                }
            }
        }

        if (arr.length < 20) {
            //var categories = await Category.find({ title: regex }, { title: 1 });
            var categories = await Category.find({ title: regex }, { title: 1 });
            console.log("categories:", categories,'arr:',arr);
            for (var i = 0; i < categories.length && arr.length < 20; i++) {
                if (!exists(categories[i]._id, arr)) {
                    //var categoryItems = await Item.find({ "categories[0].cat_id": categories._id }, { barcodeNumber: 1, categories: 1 });
                    var categoryItems = await Item.find({ "categories.cat_id": categories[i]._id });
                    //console.log('categoryItems',categories[i]._id)
                    for (var k = 0; k < categoryItems.length; k++)
                    {    
                        var cat= await Category.findOne({_id: categoryItems[k].categories[0].cat_id},{title:1,_id:0});
                        arr.push({ item: categoryItems[k], title: 'category', category: categories._id, categoryTitle: cat.title });
                    }
                }
            }
        }
        console.log('arr:',arr);
        if (arr.length < 20) {
            var categories = await Category.find({});
            var subCategories = [];
            for (var i = 0; i < categories.length && arr.length < 20; i++) {
                for (var j = 0; j < categories[i].subCategories.length && arr.length < 20; j++)
                    if (regex.test(categories[i].subCategories[j])) {
                        subCategories.push({ categoryId: categories[i]._id, subCategory: categories[i].subCategories[j] });
                    }
            }
            for (var i = 0; i < subCategories.length && arr.length < 20; i++) {
                if (!exists({ subCategory: subCategories[i].subCategory, categoryID: subCategories[i].categoryId }, arr)) {
                    {
                        items = await Item.find({ 'categories.cat_id': subCategories[i].categoryId, 'categories.subCategory': subCategories[i].subCategory });
                        //items = await Item.find({ 'categories.cat_id': subCategories[i].categoryId, 'categories.subCategory': subCategories[i].subCategory }, { barcodeNumber: 1, categories: 1 });
                        arr.push({ items, title: 'subCategory', categoryID: subCategories[i].categoryId, subCategory: subCategories[i].subCategory });
                    }
                }
            }
        }
        index++;
    }

    if (arr.length == 0) {
        var words = [], splits, syn = [];
        var item = await Item.find({}, { company: 1, particulars: 1, categories: 1 });
        var category = await Category.find({}, { title: 1, subCategories: 1 });
        for (var i = 0; i < item.length; i++) {
            if (!existsWord(item[i].particulars, words)) {
                words.push(item[i].particulars);
                splits = item[i].particulars.split(" ");
                if (splits.length > 1) {
                    for (var j = 0; j < splits.length; j++) {
                        if (!existsWord(splits[j], words) && splits[j].length > 2) {
                            words.push(splits[j]);
                        }
                    }
                }
            }
            if (!existsWord(item[i].company, words)) {
                words.push(item[i].company);
                splits = item[i].company.split(" ");
                if (splits.length > 1) {
                    for (var j = 0; j < splits.length; j++) {
                        if (!existsWord(splits[j], words) && splits[j].length > 2) {
                            words.push(splits[j]);
                        }
                    }
                }
            }
        }
        for (var i = 0; i < category.length; i++) {
            if (!existsWord(category[i].title, words)) {
                words.push(category[i].title);
                splits = category[i].title.split(" ");
                if (splits.length > 1) {
                    for (var j = 0; j < splits.length; j++) {
                        if (!existsWord(splits[j], words) && splits[j].length > 2) {
                            words.push(splits[j]);
                        }
                    }
                }
            }
            for (var j = 0; j < category[i].subCategories.length; j++) {
                if (!existsWord(category[i].subCategories[j], words)) {
                    words.push(category[i].subCategories[j]);
                    splits = category[i].subCategories[j].split(" ");
                    if (splits.length > 1) {
                        for (var k = 0; k < splits.length; k++) {
                            if (!existsWord(splits[k], words) && splits[k].length > 2) {
                                words.push(splits[k]);
                            }
                        }
                    }
                }
            }
        }
        console.log("words:", words);
        var min, closestWords = [];
        var br = term.split(' ');
        for (var f = 0; f < br.length; f++) {
            for (var i = 0; i < words.length; i++) {
                if (i == 0) {
                    min = findClosestWord(br[f], words[i]);
                    closestWords.push(words[i]);
                    console.log(words[i], min);
                }
                else {
                    var val = findClosestWord(br[f], words[i]);
                    console.log(words[i], val)
                    if (val < min) {
                        min = val;
                        closestWords = [];
                        closestWords.push(words[i]);
                    }
                    if (val == min) {
                        min = val;
                        if (!existsWord(words[i], closestWords))
                            closestWords.push(words[i]);
                    }
                }
            }
        }
        if (synonyms(term)) {
            console.log(synonyms(term).n);
            var synonymTerm = synonyms(term);
            if (synonymTerm.n) {
                for (var i = 0; i < synonymTerm.n.length; i++) {
                    if (!existsWord(synonymTerm.n[i], syn) && existsWord(synonymTerm.n[i], words))
                        syn.push(synonymTerm.n[i]);
                }
            }
            if (synonymTerm.v) {
                for (var i = 0; i < synonymTerm.v.length; i++) {
                    if (!existsWord(synonymTerm.v[i], syn) && existsWord(synonymTerm.v[i], words))
                        syn.push(synonymTerm.v[i]);
                }
            }
            if (term.toLowerCase() == "drink" || term.toLowerCase() == 'drinks')
                syn.push('beverages');
            if (term.toLowerCase() == 'fitness' || term.toLowerCase == 'fit')
                syn.push('health');
            console.log(syn);
        }
        if (closestWords.length > 5) {
            arr.push({ autoCorrect: closestWords.slice(0, 5).concat(syn) });
        }
        else {
            arr.push({ autoCorrect: closestWords.concat(syn) });
        }
    }

    //console.log(synonyms(term));

    //console.log('arr at the end is:', arr);
    return (arr);
}


async function findSimilarHints(term) {
    var arr = [];
    console.log('term in findSilimarHints:', term)
    var index = 0, regex;
    var regExpressions = [new RegExp('^' + term, "i"), new RegExp('\\b' + term, "i"), new RegExp(term, 'i')];
    var part = term.split(" ");
    console.log('part:', part)

    if (part.length > 1) {
        for (var i = 0; i < part.length; i++)
            regExpressions = regExpressions.concat([new RegExp('^' + part[i], "i"), new RegExp('\\b' + part[i], "i"), new RegExp(part[i], 'i')]);
        console.log('regular expressions:', regExpressions)
    }
    while (arr.length < 7 && index < regExpressions.length) {
        console.log('index:', index, "part index:", parseInt(index / 3) - 1);
        regex = regExpressions[index];
        var items = await Item.find({ particulars: regex }, { particulars: 1 });
        for (var i = 0; i < items.length && arr.length < 7; i++) {
            if (!existsString(items[i].particulars, arr)) {
                var result = regex.exec(items[i].particulars);
                if (index < 3)
                    arr.push({ item: items[i].particulars, startIndex: result.index, length: term.length });
                else
                    arr.push({ item: items[i].particulars, startIndex: result.index, length: part[parseInt(index / 3) - 1].length });
            }
        }

        if (arr.length < 7) {
            items = await Item.find({ company: regex }, { company: 1 });
            for (var i = 0; i < items.length && arr.length < 7; i++) {
                if (!existsString(items[i].company, arr)) {
                    var result = regex.exec(items[i].company);
                    if (index < 3)
                        arr.push({ item: items[i].company, startIndex: result.index, length: term.length });
                    else
                        arr.push({ item: items[i].company, startIndex: result.index, length: part[parseInt(index / 3) - 1].length });
                }
            }
        }

        if (arr.length < 7) {
            var categories = await Category.find({ title: regex }, { title: 1, subCategories: 1 });
            for (var i = 0; i < categories.length && arr.length < 7; i++) {
                if (!existsString(categories[i].title, arr)) {
                    var result = regex.exec(categories[i].title);
                    if (index < 3)
                        arr.push({ item: categories[i].title, startIndex: result.index, length: term.length });
                    else
                        arr.push({ item: categories[i].title, startIndex: result.index, length: part[parseInt(index / 3) - 1].length });
                }
            }
        }

        if (arr.length < 7) {
            var categories = await Category.find({});
            var subCategories = [];
            for (var i = 0; i < categories.length && arr.length < 7; i++) {
                for (var j = 0; j < categories[i].subCategories.length && arr.length < 7; j++)
                    if (regex.test(categories[i].subCategories[j])) {
                        subCategories.push(categories[i].subCategories[j]);
                    }
            }

            for (var i = 0; i < subCategories.length && arr.length < 7; i++) {
                if (!existsString(subCategories[i], arr)) {
                    {
                        var result = regex.exec(subCategories[i]);
                        if (index < 3)
                            arr.push({ item: subCategories[i], startIndex: result.index, length: term.length });
                        else
                            arr.push({ item: subCategories[i], startIndex: result.index, length: part[parseInt(index / 3) - 1].length });
                    }
                }
            }
        }
        index++;
    }
    console.log('arr at the end is:', arr);
    return (arr);
}

function findMin(x, y, z) {
    if (x <= y && x <= z)
        return x;
    if (y <= x && y <= z)
        return y;
    else
        return z;
}

function findClosestWord(term, reference) {

    var a = term.toLowerCase(), b = reference.toLowerCase();

    var d = new Array(a.length + 1);

    for (var i = 0; i < d.length; i++) {
        d[i] = new Array(b.length + 1);
    }

    // Initialising first column:
    for (var i = 0; i <= a.length; i++)
        d[i][0] = i;


    // Initialising first row:
    for (var j = 0; j <= b.length; j++)
        d[0][j] = j;

    // Applying the algorithm:
    var insertion, deletion, replacement;
    for (var i = 0; i < a.length; i++) {
        for (var j = 0; j < b.length; j++) {
            if (a.charAt(i) == (b.charAt(j)))
                d[i + 1][j + 1] = d[i][j];
            else {
                insertion = d[i + 1][j];
                deletion = d[i][j + 1];
                replacement = d[i][j];

                // Using the sub-problems
                d[i + 1][j + 1] = 1 + findMin(insertion, deletion, replacement);
            }
        }
    }
    return d[a.length][b.length];
}

router.get('/expressbilling/apis/search/:term', async (req, res) => {
    try {
        console.log(req.params.term);
        const hints = await findSimilarHints(req.params.term);
        console.log("hints:", hints)
        res.send(hints);
    } catch (err) {
        res.status(404).send('Not found.')
    }
});

router.get('/expressbilling/apis/search-results/:term', async (req, res) => {
    try {
        console.log(req.params.term);
        var response = await getResults(req.params.term);
        console.log("response:", response.length);
        if(response[0].autoCorrect)
        {
            var arr = await getResults(response[0].autoCorrect[0]);
            response = response.concat((arr));
        }
        //console.log(response);
        res.send(response);
    } catch (err) {
        res.status(404).send('Not found.');
        console.log(err);
    }
});

router.get('/expressbilling/apis/autocorrect/:term', async (req, res) => {
    try {
        console.log(req.params.term);
        var term = req.params.term;
        var min, ans;
        var arr = ['akshi', 'acdefg', 'nanda', 'adarsh', 'kmakshi', 'honda', 'cadbury', 'gandhi', 'horlicks', "kamakshi nanda"];
        for (var i = 0; i < arr.length; i++) {
            if (i == 0) {
                min = findClosestWord(term, arr[i]);
                ans = arr[i];
                console.log(arr[i], min);
            }
            else {
                var val = findClosestWord(term, arr[i]);
                console.log(arr[i], val)
                if (val < min) {
                    min = val;
                    ans = arr[i];
                }
            }
        }
        console.log("min:", min);
        console.log('answer:', ans);
        res.send(ans);
    } catch (err) {
        res.status(404).send('Not found.');
        console.log(err);
    }
});

module.exports = router; 