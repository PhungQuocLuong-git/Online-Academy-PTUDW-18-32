const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const curriculumSchema = new Schema({
    chapter_name: { type: String ,default:`Course's chapter`},
    lectures: [{
        name: { type: String, default: 'Lecture' },
        description: { type: String, default: '' },
        link: { type: String, default: '' },
        preview: { type: Boolean, default: false }
    }]
})

module.exports = mongoose.model('Curriculum', curriculumSchema);