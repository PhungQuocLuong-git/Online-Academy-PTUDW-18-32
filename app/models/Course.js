const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const slug = require('mongoose-slug-generator');



mongoose.plugin(slug);

const CourseSchema = new Schema({
    name: {type: String, default:'This is name', },
    description: {type: String, default:'This is a description', },
    thumbnail: {type: String, default:'This is a link to thumbnail', },
    short_description:{type: String, default:'This is a short description'},
    course_author: {
      type: Schema.Types.ObjectId,
      ref: "Teacher",
    },
    course_students:[{user_id: { type: Schema.Types.ObjectId, ref: "Student" }}],
    studentQty:{type:Number, default: 0},
    rating:{type:Number, default: 0},
    price:{type:Number, default: 0},
    discount_price:{type:Number,default:0},
    view:{type:Number, default: 0},
    status:{type:Number, default: 0},
    image: {type: String, default: '/public/images/feature.png'},
    preview_video: {type: String, default: ''},
    kind: {type: Number, ref:"Category"},
    // category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    slug: { type: String, slug: 'name', unique: true },
    // createdAt: {type: Date, default: Date.now},
    // updatedAt: {type: Date, default: Date.now},
    curriculum: [{
      chapter: {type:String},
      lectures: [{
        name:{type:String,default:''},
        description:{type:String,default:''},
        link:{type:String,default:''},
        preview:{type:Boolean,default:false}        
      }]
    }]
  },{
    timestamps: true,
  });

  module.exports = mongoose.model('Course', CourseSchema);


  