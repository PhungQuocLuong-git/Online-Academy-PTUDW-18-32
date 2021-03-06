const mongoose = require('mongoose');
const Schema = mongoose.Schema;
// const slug = require('mongoose-slug-generator');

const TeacherSchema = new Schema({
  username: {type: String},
  name: {type: String},
  email: {type: String},
  password: {type: String},
  msg: {type: String,default:'Teacher msg'},
  stt: {type: Number,default:0},
  short_description: {type: String,default:'a short description of teacher'},
  description: {type: String,default:'a description of teacher'},
  avatar: {type:String,default:'/public/images/avatars/default.png'},
  NumOfStudents: {type: Number,default:0},
  posted_courses: [
    {
      course_id: { type: Schema.Types.ObjectId, ref: "Course" },
    },
  ],
  },{
    timestamps: true,
  });

  module.exports = mongoose.model('Teacher', TeacherSchema);