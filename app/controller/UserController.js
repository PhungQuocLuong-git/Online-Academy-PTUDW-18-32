module.exports = {
    profile(req, res, next) {
        
        res.render('users/edit-profile');
    },
    account(req, res, next) {
        res.render('users/edit-account',{
            script: '/public/stylesheets/form.css'
        });
    },
    watchlist(req, res, next) {
        res.render('users/watch-list', {
            script: '/public/javascripts/home.js',
        });
    },
    registeredcourses(req, res, next) {
        res.render('users/registered-courses', {
            script: '/public/javascripts/home.js',
            progress: '10',
            numlesson:'25',
            percent: +'10'/+'25'*100,
        });
    },
    
    checkactive(req,res,next){
        const url = req.url+'';
        console.log(url);
        res.locals.url=url;
        next();
    },


};

