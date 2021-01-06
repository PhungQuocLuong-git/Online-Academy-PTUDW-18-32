// const { multipleMongooseToObject } = require('../../util/mongoose');
const { getMostviewed, getNewest,getMostpopular } = require('./CourseController');

module.exports = {
  async home(req, res, next) {
    var mostViewedCourses=await getMostviewed();
    var newestCousese= await getNewest();
    var catemostpopular= await getMostpopular(res);
    // console.log(catemostpopular[1]);
    res.render('home', {
      mostViewed: mostViewedCourses,
      newest: newestCousese,
      catemostpopular:catemostpopular[0],
      subcatemostpopular:catemostpopular[1],
      script: '/public/javascripts/home.js',
      extraStyle:'/public/stylesheets/home.css'      
    });
  }
};