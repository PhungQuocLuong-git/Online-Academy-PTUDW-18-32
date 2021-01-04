// const { multipleMongooseToObject } = require('../../util/mongoose');
const { getMostviewed, getNewest } = require('./CourseController');

module.exports = {
  async home(req, res, next) {
    var mostViewedCourses=await getMostviewed();
    var newestCousese= await getNewest();
    res.render('home', {
      mostViewed: mostViewedCourses,
      newest: newestCousese,
      script: '/public/javascripts/home.js',
      extraStyle:'/public/stylesheets/home.css'      
    });
  }
};