const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CategorySchema = new Schema({
    CatName: {type: String, require: true},
});

module.exports = mongoose.model('Category', CategorySchema);