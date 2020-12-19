const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const slug = require('mongoose-slug-generator');



mongoose.plugin(slug);

const CourseSchema = new Schema({
    name: {type: String, default:'This is name', },
    description: {type: String, default:'This is description', },
    description_thumnail: {type: String, default:'This is description thumnail', },
    course_author: {
      type: Schema.Types.ObjectId,
      ref: "Teacher",
    },
    course_students:[{user_id: { type: Schema.Types.ObjectId, ref: "Student" }}],
    rating:{type:Number, default: 0},
    price:{type:Number, default: 0},
    view:{type:Number, default: 0},
    status:{type:Number, default: 0},
    image: {type: String, default: '/public/images/feature.png'},
    kind: {type: Number, default: 1},
    // category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    slug: { type: String, slug: 'name', unique: true }
    // createdAt: {type: Date, default: Date.now},
    // updatedAt: {type: Date, default: Date.now},
  },{
    timestamps: true,
  });




  module.exports = mongoose.model('Course', CourseSchema);


  