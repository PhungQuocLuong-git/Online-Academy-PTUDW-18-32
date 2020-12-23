const mongoose = require('mongoose');
const Schema = mongoose.Schema;
// const slug = require('mongoose-slug-generator');

const StudentSchema = new Schema({
  username: {type: String},
  name: {type: String},
  email: {type: String},
  password: {type: String},
  money: {type: Number,default: 0},
  booked_courses: [
    {
      course_id: { type: Schema.Types.ObjectId, ref: "Course" },
    },
  ],
  wish_courses: [
    {
      course_id: { type: Schema.Types.ObjectId, ref: "Course" },
    },
  ],
  cart_courses: [
    {
      course_id: { type: Schema.Types.ObjectId, ref: "Course" },
    },
  ],
  },{
    timestamps: true,
  });

  module.exports = mongoose.model('Student', StudentSchema);