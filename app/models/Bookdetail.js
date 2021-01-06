const mongoose = require('mongoose');
const Schema = mongoose.Schema;
// const slug = require('mongoose-slug-generator');

// mongoose.plugin(slug);

const BookdetailSchema = new Schema({
    course_id: { type: Schema.Types.ObjectId, ref: "Course" },
    student_id: { type: Schema.Types.ObjectId, ref: "Student" },
    catid: { type: String, require: true },
    subcatid: { type: String, require: true },

},
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Bookdetail', BookdetailSchema);