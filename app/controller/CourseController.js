module.exports = {
    list(req, res){
        res.render('courses/list',{
            script:'/public/javascripts/home.js'
        });
    },
    search(req, res){
        res.render('courses/search',{
            script:'/public/javascripts/home.js'
        });
    },
    detail(req, res) {
        res.render('courses/detail',{
            extraStyle: '/public/stylesheets/detail.css',
            script:'/public/javascripts/home.js'
        });
    }
   
};

