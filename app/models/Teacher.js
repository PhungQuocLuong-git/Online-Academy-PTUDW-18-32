const mongoose = require('mongoose');
const Schema = mongoose.Schema;
// const slug = require('mongoose-slug-generator');

const TeacherSchema = new Schema({
  username: {type: String},
  name: {type: String},
  email: {type: String},
  password: {type: String},
  description: {type: String,default:'description of teacher'},
  posted_courses: [
    {
      course_id: { type: Schema.Types.ObjectId, ref: "Course" },
    },
  ],
  },{
    timestamps: true,
  });

  module.exports = mongoose.model('Teacher', TeacherSchema);