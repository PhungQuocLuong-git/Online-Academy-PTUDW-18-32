const Course = require('../models/Course');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const { mongooseToObject} = require('../../util/mongoose');
const { collection } = require('../models/Course');

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
                            //wished,
                            extraStyle: '/public/stylesheets/home.css',
                            script:'/public/javascripts/home.js'
                            } ))
                    
                })
                .catch(err => res.json({msg:'fail cmnr'}));
        // res.render('courses/detail',{
        //     script:'/public/javascripts/home.js'
        // });
            },
   
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
                console.log(ret);
                
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
                console.log(course,req.session.user);

                return Promise.all([Course.findByIdAndUpdate(course._id,course),
                    Student.findByIdAndUpdate(req.session.user._id,req.session.user)])
            })
            .then(([user,course]) => {
                res.json({user,course});
            })
            .catch( () => {
                res.json({msg:'Bn k mua dc khoa hc nay'});
            })
    },

    //[POST]/courses/wish/:id
    wish(req,res,next){
        // res.json({msg:req.params.id});
        console.log('wish');
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

    wished(req,res) {
        Student.findById(req.session.user._id).populate('wish_courses').then(user => {
            user.wish_courses.forEach(wish => {
                if(wish.course_id.equals(req.query.id)){
                    res.json(true);
                    return;
                }
            });
            res.json(false);
        }).catch(err => res.json({msg:'fail cmnr'}));
    },
    
};

