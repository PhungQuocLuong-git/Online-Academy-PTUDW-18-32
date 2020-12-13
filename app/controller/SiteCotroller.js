
module.exports = {
  home(req, res, next) {
    res.render('home', {
      script: '/javascripts/home.js'
    });
  }
};