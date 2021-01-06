const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const slug = require('mongoose-slug-generator');
var mongoosePaginate = require('mongoose-paginate');



mongoose.plugin(slug);

const CourseSchema = new Schema({
  name: { type: String, default: 'This is name', },
  description: { type: String, default: 'This is a description', },
  thumbnail: { type: String, default: 'This is a link to thumbnail', },
  short_description: { type: String, default: 'This is a short description' },
  course_author: {
    type: Schema.Types.ObjectId,
    ref: "Teacher",
  },
  course_students: [{ user_id: { type: Schema.Types.ObjectId, ref: "Student" } },{timestamps: true}],
  studentQty: { type: Number, default: 0 },
  rating: { type: String, default: '0'},
  price: { type: Number, default: 0 },
  discount_price: { type: Number, default: 0 },
  view: { type: Number, default: 0 },
  status: { type: Number, default: 0 },
  image: { type: String, default: '/public/images/feature.png' },
  preview_video: { type: String, default: '' },
  catid: { type: String, require: true },
  subcatid: { type: String, require: true },
  curriculum: [
    { type: Schema.Types.ObjectId, ref: 'Curriculum' }
  ],
  rates: [
    {type:Schema.Types.ObjectId,ref:'Rate'}
  ],
  // category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
  slug: { type: String, slug: 'name', unique: true },
  // createdAt: {type: Date, default: Date.now},
  // updatedAt: {type: Date, default: Date.now},
}, {
  timestamps: true,
});

CourseSchema.index({
  name: 'text',
  description: 'text',
}, {
  weights: {
    name: 10,
    description: 1,
  },
});

CourseSchema.query.sortable = function (req) {
  if (req.query.hasOwnProperty('field')) {
    const isValidType = ['asc', 'desc'].includes(req.query.type);
    return this.sort({
      [req.query.field]: isValidType ? req.query.type : 'desc',
    })
  };
  return this;
}

CourseSchema.remove('delete',function(next) {
  console.log('mdw ran');
  this.model('Student').update(
      { },
      { "$pull": { "booked_courses": this._id } },
      { "multi": true },
      next()
  );
})

CourseSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Course', CourseSchema);


