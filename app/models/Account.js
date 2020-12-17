const mongoose = require('mongoose');
const Schema = mongoose.Schema;
// const slug = require('mongoose-slug-generator');

const AccountSchema = new Schema({
  username: {type: String},
  email: {type: String},
  password: {type: String},
  // fullname: {type: String},
  role: {type: Number, default: 1 },
  booked_courses: [
    {
      course_id: { type: Schema.Types.ObjectId, ref: "Course" },
    },
  ],
  posted_courses: [
    {
      course_id: { type: Schema.Types.ObjectId, ref: "Course" },
    },
  ],
    // gender: {type: String, },
    // createdAt: {type: Date, default: Date.now},
    // updatedAt: {type: Date, default: Date.now},
  },{
    timestamps: true,
  });

  module.exports = mongoose.model('Account', AccountSchema);