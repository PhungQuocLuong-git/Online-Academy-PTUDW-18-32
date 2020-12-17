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
    detail(req, res,next) {
        let username = req.session.username;
        Course.findOne({ slug: req.params.slug}).populate("course_author")
            .then(course => {
                res.render('courses/detail',{course:  mongooseToObject(course),
                    extraStyle: '/public/stylesheets/detail.css',
                    script:'/public/javascripts/home.js'
                    } );
            })
            .catch(next);
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
    },

    book(req,res,next){
        // res.json({test1: req.params.id,test2: req.session.username})
        Promise.all([Course.findOne({_id:req.params.id}),Account.findOne({username: req.session.username})])
            .then(([course2,user2]) => {
                course2.course_students.forEach(student => {
                    if(student.user_id.equals(user2._id))
                        res.json({err:'Bn da dki khoa hc nay r'});
                });
                course2.course_students.push({user_id: user2._id});
                user2.booked_courses.push({course_id: course2._id});
                Promise.all([Course.updateOne({_id:course2._id},course2),Account.updateOne({username:user2.username},user2)])
                    // .then(([r1,r2]) => res.json({r1,r2,test1:course2.course_students, test2:  user2.booked_courses}));
                    .then(res.redirect('/'));
                })
    }
};

