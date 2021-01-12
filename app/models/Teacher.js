const mongoose = require('mongoose');
const Schema = mongoose.Schema;
// const slug = require('mongoose-slug-generator');

const TeacherSchema = new Schema({
  username: {type: String},
  name: {type: String},
  email: {type: String},
  password: {type: String},
  stt: {type: Number,default:0},
  short_description: {type: String,default:'a short description of teacher'},
  description: {type: String,default:'a description of teacher'},
  avatar: {type:String,default:'https://lh3.googleusercontent.com/proxy/kwGs56fxpkEgQLTV0wDA3F3jo65CEvZPiiGq-0Y0zoICbsMO-uK_m9yIHCa4LjXRZQf8GI8qRSZBzuqqtz59kDVIcveX9szEe9HL45fhjiRRPIt4-KXsDg0ubkpzjGk5YovTnUEw6aqHggj9'},
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