const Course = require('../models/Course');
const { mongooseToObject} = require('../../util/mongoose')

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
    },
   
    create(req,res){
        // res.json({msg:'helo'});
        res.render('courses/create',{
            layout:false,
        })
    },

    store(req,res,next){
        req.body.course_author = req.session.user._id;
        const course = new Course(req.body);
        course.save()
            .then(() => res.redirect('/'))
            .catch(next);
    }
};

