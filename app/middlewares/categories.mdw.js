// const e = require('express');
var categoriesSchema = require('../models/Category');
var subcategories = require('../models/Subcategory');

async function loadCategories(req, res, next) {
    var list = await categoriesSchema.find();
    list = list.map(mongoose => mongoose.toObject());


    const len = list.length;
    for (var i = 0; i < len; i++) {
        var sublist = await subcategories.find({CatID: list[i]._id});
        sublist = sublist.map(mongoose => mongoose.toObject());
        list[i]['sub']=sublist;
    }
    res.locals.lcCategories = list;
    next();

}

module.exports.loadCategories = loadCategories;