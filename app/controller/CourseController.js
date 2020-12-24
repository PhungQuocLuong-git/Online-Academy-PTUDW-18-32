const Course = require('../models/Course');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
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
        Promise.all([Course.findOne({ slug: req.params.slug}).populate("course_author"),
                    Student.findById(req.session.user._id).populate("wish_courses"),])
                .then(([course,user])=> {
                    // res.json({au:course.course_author.name});
                    let wished = false;
                    user.wish_courses.forEach(wish => {
                        if(wish.course_id.equals(course._id))
                            wished=true;
            });
                    course.view++;
                    Course.updateOne({slug:course.slug},course)
                        .then(res.render('courses/detail',{course:  mongooseToObject(course),
                            wished,
                            extraStyle: '/public/stylesheets/detail.css',
                            script:'/public/javascripts/home.js'
                            } ))
                    
                })
                .catch(err => res.json({msg:'fail cmnr'}));
            }
    ,
   
    create(req,res){
        res.render('courses/create',{
            layout:false,
        })
    },

    

    store(req,res,next){
        req.body.course_author = req.session.user._id;
        const course = new Course(req.body);
        Promise.all([course.save(),Teacher.findOne({_id:req.session.user._id})])
            .then (([result, user]) => {
                const id = result._id;
                user.posted_courses.push({ course_id: id });
                Teacher.updateOne({_id:user._id},user)
                    .then(res.redirect('/'));
            })
    },

    book(req,res,next){
        Promise.all([Course.findOne({_id:req.params.id}),Student.findOne({username: req.session.username})])
            .then(([course2,user2]) => {
                course2.course_students.forEach(student => {
                    if(student.user_id.equals(user2._id))
                        res.json({err:'Bn da dki khoa hc nay r'});
                });

                if(user2.money < course2.price){
                    res.json('Bn hok đủ money');
                }
                user2.money -=course2.price;
                let i = 0;
                user2.cart_courses.forEach(cou => {
                    if(course2._id.equals(cou.course_id))
                        user2.cart_courses.splice(i,1);
                    i++;
                })
                
                
                course2.course_students.push({user_id: user2._id});
                user2.booked_courses.push({course_id: course2._id});
                req.session.user = user2;
                Promise.all([Course.updateOne({_id:course2._id},course2),Student.updateOne({username:user2.username},user2)])
                    // .then(([r1,r2]) => res.json({r1,r2,test1:course2.course_students, test2:  user2.booked_courses}));
                    .then(res.redirect('/'));
                })
    },

    //[POST]/courses/wish/:id
    wish(req,res,next){
        // res.json({msg:req.params.id});
        Student.findById(req.session.user._id).populate('wish_courses')
            .then(user => {
                let wished = false;
                let i=0;
                let j = 0;
                user.wish_courses.forEach(wish => {
                    if(wish.course_id.equals(req.params.id)){
                        wished=true;
                        j=i;
                    }
                    i++;
                });
                if(wished)
                    user.wish_courses.splice(j,1);
                else
                    user.wish_courses.push({course_id: req.params.id});
                Student.updateOne({_id:req.session.user._id},user)
                    .then(res.redirect('/user/watch-list'));
            })
    },

    // add(req,res,next){
    //     // res.json({msg:req.params.id});
    //     Student.findById(req.session.user._id).populate('cart_courses')
    //         .then(user => {
    //             if(
    //                 user.cart_courses.some(course => course.course_id.equals(req.params.id) ) ||
    //                 user.booked_courses.some(course => course.course_id.equals(req.params.id) )
    //             )
    //             res.json({msg:'failll'});
    //             else
    //                 {
    //                 user.cart_courses.push({course_id: req.params.id});
    //                 console.log('bat dong bo');
    //             req.app.locals.cartCount = user.cart_courses.length;
    //             Student.updateOne({_id:req.session.user._id},user)
    //                 .then(() => {
    //                     req.session.user = user;
    //                     res.redirect('/user/watch-list');
    //                 });
    //             }
                
    //             // res.json({msg:'Bat dong bo'});
                
    //         })
    // },


    //[POST]/courses/add/:id
     add(req,res,next){
        Student.findById(req.session.user._id).populate('cart_courses')
            .then( user => {return new Promise(  function(resolve,reject) {
                if(user.cart_courses.some(course => course.course_id.equals(req.params.id))||
                user.booked_courses.some(course => course.course_id.equals(req.params.id))){
                    reject(user);
                }
                else
                    resolve(user);
            }) } )
            .then(user =>{ 
                user.cart_courses.push({course_id: req.params.id});
                req.app.locals.cartCount = user.cart_courses.length;
                Student.updateOne({_id:req.session.user._id},user)
                    .then(res.redirect('/'));
            })
            .catch(user =>{
                res.json({msg:'fail',user});
            })
     }
};

