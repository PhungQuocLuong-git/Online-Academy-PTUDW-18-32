const { multipleMongooseToObject } = require('../../util/mongoose');
const { getMostviewed } = require('./CourseController');
const courseController = require('./CourseController');

module.exports = {
  async home(req, res, next) {
    var mostViewedCourses=await getMostviewed();
    res.render('home', {
      mostViewed: mostViewedCourses,
      script: '/public/javascripts/home.js',
      extraStyle:'/public/stylesheets/home.css'      
    });
  }
};