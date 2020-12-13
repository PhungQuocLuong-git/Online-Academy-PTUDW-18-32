
module.exports={
    home(req, res, next) {
        res.render('home',{
          script:'/scripts/home.js'
        });
    }
};