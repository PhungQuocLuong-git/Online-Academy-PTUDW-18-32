const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const slug = require('mongoose-slug-generator');

mongoose.plugin(slug);

const CategorySchema = new Schema({
    CatName: {type: String, require: true},
    slug: { type: String, slug: 'CatName', unique: true },
});

module.exports = mongoose.model('Category', CategorySchema);