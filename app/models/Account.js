const mongoose = require('mongoose');
const Schema = mongoose.Schema;
// const slug = require('mongoose-slug-generator');

const AccountSchema = new Schema({
  username: {type: String},
  email: {type: String},
  password: {type: String},
  // fullname: {type: String},
    role: {type: Number, default: 1 },
    // gender: {type: String, },
    // createdAt: {type: Date, default: Date.now},
    // updatedAt: {type: Date, default: Date.now},
  },{
    timestamps: true,
  });

  module.exports = mongoose.model('Account', AccountSchema);