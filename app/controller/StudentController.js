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
                    .then(res.redirect('/'))                
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

    // [GET] /Student/cart/:id
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
                req.app.locals.user = mongooseToObject(user);
                res.render('students/cart',{
                    total,
                    student:mongooseToObject(user),
                    extraStyle: '/public/stylesheets/home.css',
                            script:'/public/javascripts/home.js'
                })
            });
    }

    // [POST] /Student/logout
    logout(req,res,next) {
        req.app.locals.role = 0;
        req.session.role=0;
        req.session.destroy(() => {
            res.redirect('/student/login');
          });
    }
    // [POST] /student/check
    check(req,res,next) {
        Student.findOne({username: req.body.username}).populate({
            path: "cart_courses.course_id",
            select: "name slug price description course_author",
            populate: { path: "course_author", select: "name" },
            
          })
            .then( user => {
                req.app.locals.cartCount = user.cart_courses.length;
                bcrypt.compare(req.body.password,user.password).then((result)=>{
                    if(result){
                    req.app.locals.idUser = user._id;
                    req.session.user = mongooseToObject(user);
                    req.app.locals.user = mongooseToObject(user);
                    req.session.username = req.body.username;
                    req.app.locals.nameUser = user.username;
                    req.app.locals.cartUser = user.cart_courses;
                    req.session.role=1;
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
    
    // [DELETE] /student//delcart/:id
    delcart(req,res,next){
        Student.findById(req.session.user._id).populate({
            path: "cart_courses.course_id",
            select: "name slug price course_author",
            populate: { path: "course_author", select: "name" },
            
          })
            .then(user => {
                let i= 0;
                user.cart_courses.forEach( course => {
                    if(course.course_id.equals(req.params.id))
                        user.cart_courses.splice(i,1);
                    i++;
                }
                
                )
                req.session.user = mongooseToObject(user);
                req.app.locals.user = mongooseToObject(user);

                Student.updateOne({_id:req.session.user._id},user)
                    .then(res.redirect(`/student/cart/${user._id}`));
            });
    }

    // [POST] /student//handle-form-actions
    async handleFormActions(req,res,next){
        // res.json(req.body);
        var idCourses = req.body.courseIds;
        let user = await Student.findById(req.session.user._id).populate({
                    path: "cart_courses.course_id",
                    select: "name slug price course_author",
                    populate: { path: "course_author", select: "name" },
                    
                  });
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
                req.session.user = mongooseToObject(user);
                Student.updateOne({_id:user.id},user)
            case 'book' :
                var total = +req.body.total;
                // res.json(req.session.user);
                if(total<= user.money){
                    var courses = await Course.find({_id: { $in: idCourses} }).populate('course_students')
                    let i = courses.length - 1;
                    // res.json({t1:user,t2:user.cart_courses,t3:req.session.user,t4:req.session.user.cart_courses})
                    courses.forEach( async function(course)  {
                        user.booked_courses.push({course_id:course.id});
                        let i = 0;
                        // user.cart_courses.splice(user.cart_courses.findIndex(co => course.course_id._id.equals(co.course_id)),1);
                        user.cart_courses.forEach(course2 => {
                            if(course._id.equals(course2.course_id._id)){
                                user.cart_courses.splice(i,1);
                            }
                            i++;
                        })
                        course.course_students.push({user_id: req.session.user._id});
                        let c = await Course.findByIdAndUpdate(course._id,course);
                    })
                    req.session.user.money -=total;                              
                    let student = await  Student.findByIdAndUpdate(req.session.user._id,user).populate({
                        path: "cart_courses.course_id",
                        select: "name slug price course_author",
                        populate: { path: "course_author", select: "name" },
                        
                      });
                    
                    if(student){
                        req.session.user = mongooseToObject(user);
                        req.app.locals.user = mongooseToObject(user);
                        res.redirect('/');
                    }
                }
            else {
                res.json({total,urm:user.money});
            }

            }
    }
}

module.exports = new StudentController;