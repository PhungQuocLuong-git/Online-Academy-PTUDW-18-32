const mongoose = require('mongoose');
const Schema = mongoose.Schema;
// const slug = require('mongoose-slug-generator');

const StudentSchema = new Schema({
  name: {type: String},
  email: {type: String},
  password: {type: String},
  money: {type: Number,default: 0},
  avatar: {type:String,default:'https://lh3.googleusercontent.com/proxy/kwGs56fxpkEgQLTV0wDA3F3jo65CEvZPiiGq-0Y0zoICbsMO-uK_m9yIHCa4LjXRZQf8GI8qRSZBzuqqtz59kDVIcveX9szEe9HL45fhjiRRPIt4-KXsDg0ubkpzjGk5YovTnUEw6aqHggj9'},
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