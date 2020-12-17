const Course = require('../models/Course');
const Account = require('../models/Account');
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
        res.render('courses/create',{
            layout:false,
        })
    },

    store(req,res,next){
        req.body.course_author = req.session.user._id;
        const course = new Course(req.body);
        Promise.all([course.save(),Account.findOne({_id:req.session.user._id})])
            .then (([result, user]) => {
                const id = result._id;
                user.posted_courses.push({ course_id: id });
                Account.updateOne({_id:user._id},user)
                    .then(res.redirect('/'));
            })
    }
};

