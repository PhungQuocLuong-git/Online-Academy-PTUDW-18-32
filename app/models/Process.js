const mongoose = require('mongoose');
const Schema = mongoose.Schema;
// const slug = require('mongoose-slug-generator');

const ProcessSchema = new Schema({
  student_id: {type: Schema.Types.ObjectId, ref: "Student"},
  course_id: {type: Schema.Types.ObjectId, ref: "Course"},
  process: [
      { type: Schema.Types.ObjectId, ref: "Course" ,default: [1]},
  ],
  continue:{type: String, default: ''  }
  
  },
  {
    timestamps: true,
  });

  module.exports = mongoose.model('Process', ProcessSchema);