const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const rateSchema = new Schema({
    course_id: {type:mongoose.Types.ObjectId},
    student_id: {type:mongoose.Types.ObjectId},
    student_name: {type:String,default:''},
    student_avatar: {type:String,default:''},
    rate_value: {type:String,default:'0'},
    comment: {type:String,default:''}
})

module.exports = mongoose.model('Rate', rateSchema);