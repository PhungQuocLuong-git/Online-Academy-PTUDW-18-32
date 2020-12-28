const Course = require('../models/Course');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const { mongooseToObject, multipleMongooseToObject } = require('../../util/mongoose');
const { collection } = require('../models/Course');

module.exports = {
    list(req, res) {
        res.render('courses/list', {
            script: '/public/javascripts/home.js'
        });
    },

    search(req, res) {
        res.render('courses/search', {
            script: '/public/javascripts/home.js'
        });
    },

    async detail(req, res, next) {
        try {
            var course = await Course.findOne({ slug: req.params.slug }).populate("course_author");
            course.view++;
            await Course.updateOne({ slug: course.slug }, course);
            res.render('courses/detail', {
                course: mongooseToObject(course),
                extraStyle: '/public/stylesheets/home.css',
                script: '/public/javascripts/home.js'
            });
        } catch (err) {
            res.json({ msg: 'Something happened!!!' });
        }
    },

    create(req, res) {
        res.render('courses/create', {
            layout: false,
        })
    },

    fts(req, res) {
        Course.find({
            $text: { $search: req.body.kw },
          }).populate('course_author course_students')
            .then(courses => res.render('courses/search',{
                courses: multipleMongooseToObject(courses)
            }))
            .catch(error => console.error(error));
    },


    store(req, res, next) {
        req.body.course_author = req.session.user._id;
        const course = new Course(req.body);
        Promise.all([course.save(), Teacher.findOne({ _id: req.session.user._id })])
            .then(([result, user]) => {
                const id = result._id;
                user.posted_courses.push({ course_id: id });
                Teacher.updateOne({ _id: user._id }, user)
                    .then(res.redirect('/'));
            })
    },

    //[POST]/courses/add/:id
    add(req,res,next){
        Student.findById(req.session.user._id).populate("cart_courses.course_id")
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
                return Student.findByIdAndUpdate(req.session.user._id,user).populate("cart_courses.course_id")
            })
            .catch(user =>{
                res.json({msg:'fail',user});
            })
            .then(user => {
                req.session.user = mongooseToObject(user);
                req.app.locals.user = mongooseToObject(user);
                res.redirect('/student/cart/'+user._id);
            })
     },

    book(req,res,next){
        
        Course.findById(req.params.id).populate( 'course_students.user_id' )
            .then(course => {return new Promise( function(resolve,reject) {
                if(
                    course.course_students.some(course => course.course_id.equals(req.session.user._id))){
                        reject(course)
                    }
                    else
                        resolve(course);
            })
            })
            .catch (course => {
                res.json({msg:'fail',course})
            })
            .then (course => 
                {return new Promise(function(resolve,reject){
                // res.json(req.session.user.cart_courses.findIndex(cours => cours.course_id.equals(req.params.id)))
                var ret = req.session.user.cart_courses.findIndex(cours => cours.course_id._id.equals(req.params.id));
                if(course.price > req.session.user.money)
                    reject();
                else{
                    resolve([ret,course]);
                }
            })}
            )
            .then(  ([ret,course]) => {
                if(ret>=0)
                    req.session.user.cart_courses.splice(ret,1);
                course.course_students.push({user_id: req.session.user._id});
                req.session.user.booked_courses.push({course_id: course._id});
                req.session.user.money -=course.price;

                return Promise.all([Course.findByIdAndUpdate(course._id,course),
                    Student.findByIdAndUpdate(req.session.user._id,req.session.user).populate({
                        path: "cart_courses.course_id",
                        select: "name slug price course_author",
                        populate: { path: "course_author", select: "name" },
                        
                      })])
            })
            .then(([course,user]) => {
                req.session.user = mongooseToObject(user);
                req.app.locals.user = mongooseToObject(user);
                res.redirect('/student/cart/'+user._id);
            })
            .catch( () => {
                res.json({msg:'Bn k mua dc khoa hc nay'});
            })
    },

    //[POST]/courses/wish/:id
    wish(req, res, next) {
        // res.json({msg:req.params.id});
        console.log('wish');
        Student.findById(req.session.user._id).populate('wish_courses')
            .then(user => {
                let wished = false;
                let i = 0;
                let j = 0;
                user.wish_courses.forEach(wish => {
                    if (wish.course_id.equals(req.params.id)) {
                        wished = true;
                        j = i;
                    }
                    i++;
                });
                if (wished)
                    user.wish_courses.splice(j, 1);
                else
                    user.wish_courses.push({ course_id: req.params.id });

                Student.updateOne({ _id: req.session.user._id }, user)
                    .then(res.redirect('/user/watch-list'));
            })
    },

    async wished(req, res) {
        var user = await Student.findById(req.session.user._id).populate('wish_courses');
        var isWished =user.wish_courses.some(course => course.course_id.equals(req.query.id));
        if (isWished) {
            res.json(true);
        }
        else res.json(false);
    },
    //[POST]/courses/add/:id
    // async add(req, res, next) {
    //     var user = await Student.findById(req.session.user._id).populate('cart_courses');
    //     let added, booked;
    //     added = user.cart_courses.some(course => course.course_id.equals(req.params.id));
    //     booked = user.booked_courses.some(course => course.course_id.equals(req.params.id));
    //     if (booked)
    //         res.json('Ban da mua khoa hoc nay');
        
    //     if (added)
    //         res.json({ msg: 'Bn da them khoa hc nay r' });

    //     if(!booked && !added){
    //         user.cart_courses.push({ course_id: req.params.id });
    //         await Student.updateOne({ _id: req.session.user._id }, user);
    //         req.session.user = user;
    //         res.redirect('/user/watch-list');
    //     }
    // },

    delcart(req, res, next) {
        res.json({ msg: req.params.id });
    },

    //Most viewed courses
    async getMostviewed() {
        var courses = await Course.find().populate('course_author');
        courses.sort((course1, course2) => { course1.view - course2.view });
        // editedCourses=courses.slice(0,10);
        editedCourses = {
            first_3: multipleMongooseToObject(courses.slice(0, 3)),
            next_3: multipleMongooseToObject(courses.slice(3, 6)),
            last_3: multipleMongooseToObject(courses.slice(6, 9)),
            last_1: mongooseToObject(courses[9])
        }
        //...mongooseToObject(courses[9])
        return editedCourses;
    },
    //Most popular courses
    getMostpopular() {

    },
    //Most highligted courses
    getMostHighlighted() {

    },
    //Newest courses
    getNewest() {

    },
};

