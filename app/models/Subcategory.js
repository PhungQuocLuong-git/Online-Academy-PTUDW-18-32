const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SubcategorySchema = new Schema({
    CatID : {type: String, require: true},
    SubCatName: {type: String, require: true},
});

module.exports = mongoose.model('Subcategory', SubcategorySchema);