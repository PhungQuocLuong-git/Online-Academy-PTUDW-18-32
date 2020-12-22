const Student = require('../models/Student');
const Course = require('../models/Course');
const { mongooseToObject} = require('../../util/mongoose');

// Hash password
const bcrypt = require('bcrypt');
const saltRounds = 10;


class StudentController{

    // [GET] /Student/create
    create(req,res) {
        res.render('students/create',{
            layout:false,
        });
    }

    // [POST] /Student/store
    store(req,res,next) {

        Promise.all([Student.findOne({username: req.body.username}),bcrypt.hash(req.body.password, saltRounds)])
            .then(([user,hash]) => {
                if(user) res.json({err:'Existed username'})
                else {
                    req.body.password= hash;
                    new Student(req.body).save()
                        .then (res.redirect('/'));
                    
                }
            });
            
        // res.json(req.body);

    }

    // [GET] /Student/login
    login(req,res,next) {
        res.render('students/login',{
            layout:false,
        });
    }

    cart(req,res){
        // res.json({msg:req.params.id});
        Student.findById(req.params.id).populate({
            path: "cart_courses.course_id",
            select: "name slug price course_author",
            populate: { path: "course_author", select: "name" },
            
          })
            .then(user => {
                let total = 0;
                // var cart= user.cart_courses;
                // res.json({user,cart:user.cart_courses[0].course_id.name})
                user.cart_courses.forEach(course => {
                    console.log(course.course_id.price);
                    total = total + course.course_id.price;
                })
                // res.json(total);
                res.render('students/cart',{
                    total,
                    student:mongooseToObject(user)
                })
            });
    }

    // [POST] /Student/logout
    logout(req,res,next) {
        req.app.locals.role = 0;
        req.session.destroy(() => {
            res.redirect('/student/login');
          });
    }

    // [PATCH] /Student/:id
    swap(req,res,next) {
        var roleSwap = 1;
        if(req.session.user.role===1){
            roleSwap = 2;
        }
        
        Student.updateOne({_id:req.params.id},{role:roleSwap})
            .then(() => {
                req.session.user.role = roleSwap;
                req.app.locals.user = req.session.user;
                req.app.locals.role = roleSwap;
                res.redirect('/')
            });
    }

    // [POST] /student/check
    check(req,res,next) {
        Student.findOne({username: req.body.username})
            .then( user => {
                bcrypt.compare(req.body.password,user.password).then((result)=>{
                    if(result){
                    req.app.locals.idUser = user._id ;
                    req.app.locals.user = user;
                    req.session.user = user;
                    req.session.username = req.body.username;
                    req.app.locals.nameUser = user.username;
                    req.app.locals.role = 1;
                    res.redirect('/')
                      } else {
                        res.redirect('/student/login');
                      }
                    })
                    .catch((err)=>res.json({error1: err}))
                })
                .catch(err => res.json({err2: err}));
        // res.json(req.body)
    }
    
    delcart(req,res,next){
        Student.findById(req.session.user._id)
            .then(user => {
                let i= 0;
                user.cart_courses.forEach( course => {
                    if(course.course_id.equals(req.params.id))
                        user.cart_courses.splice(i,1);
                    i++;
                }
                )
                Student.updateOne({_id:req.session.user._id},user)
                    .then(res.redirect(`/student/cart/${user._id}`));
            });
    }

    handleFormActions(req,res,next){
        // res.json({test:typeof(req.body.total)})
        var idCourses = req.body.courseIds;
        Student.findById(req.session.user._id)
            .then(user => {
                switch(req.body.action){
                    case 'delete':
                        idCourses.forEach( id => {
                            let i = 0;
                            user.cart_courses.forEach(course => {
                                if(course.course_id.equals(id))
                                    {user.cart_courses.splice(i,1);}
                                i++;                               
                            })
                        })
                        Student.updateOne({_id:user.id},user)
                            .then(res.redirect('/'));
                    case 'book':
                        var total = +req.body.total;
                        if(total<=req.session.user.money)
                        {

                            Course.find({_id: { $in: idCourses} }).populate('course_students')
                                .then (courses => {
                                    courses.forEach(course => {
    
                                        req.session.user.booked_courses.push({course_id:course.id});
                                        let i = 0;
                                        req.session.user.cart_courses.forEach(course2 => {
                                            if(course._id.equals(course2.course_id)){
                                                req.session.user.cart_courses.splice(i,1);
                                            }
                                            i++;
                                        })
                                        course.course_students.push({user_id: req.session.user._id});
                                        Course.updateOne({_id:course._id},course)
                                            .then(console.log('success'));
                                        
                                    })
                                    req.session.user.money -=total;
                                    Student.updateOne({_id:req.session.user._id},req.session.user)
                                        .then(res.redirect('/'));
                                    // res.json({test:course[0].course_students,test2: course[1].course_author,test3:course});
                                });
                        }
                        else{
                            res.json({msg:'Bn hok đủ money'});
                        }

            }
                }

            )
    }
}

module.exports = new StudentController;