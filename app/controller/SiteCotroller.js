// const { multipleMongooseToObject } = require('../../util/mongoose');
const { getMostviewed, getNewest,getMostpopular,getMostHighlighted } = require('./CourseController');

module.exports = {
  async home(req, res, next) {
    var mostViewedCourses=await getMostviewed();
    var newestCousese= await getNewest();
    var catemostpopular= await getMostpopular(res);
    var getMostHight= await getMostHighlighted(res);
    
    // console.log(catemostpopular[1]);
    res.render('home', {
      mostViewed: mostViewedCourses,
      newest: newestCousese,
      catemostpopular:catemostpopular[0],
      subcatemostpopular:catemostpopular[1],
      getMostHight:getMostHight,
      extraStyle:'/public/stylesheets/home.css' 
    });
  },
  async logOut(req,res,next){
    let destroy = await (req.session.destroy());
    if(destroy){
      req.app.locals.role = 0;
      req.app.locals.user = {};
      res.json('true');
    }
    else
      res.json('false');
    
  }
};