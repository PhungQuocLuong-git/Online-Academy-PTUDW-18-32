module.exports = {
    list(req, res){
        res.render('courses/list',{
            script:'/javascripts/home.js'
        });
    }

};

