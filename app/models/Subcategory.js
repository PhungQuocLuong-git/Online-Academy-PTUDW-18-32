const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const slug = require('mongoose-slug-generator');

mongoose.plugin(slug);

const SubcategorySchema = new Schema({
    CatID : {type: String, require: true},
    SubCatName: {type: String, require: true},
    slug: { type: String, slug: 'SubCatName', unique: true },
});

module.exports = mongoose.model('Subcategory', SubcategorySchema);