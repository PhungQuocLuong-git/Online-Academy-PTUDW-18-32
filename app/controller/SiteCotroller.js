
module.exports = {
  home(req, res, next) {
    res.render('home', {
      script: '/public/javascripts/home.js'
    });
  }
};