const Student = require('../models/Student');
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

    // [POST] /Student/logout
    logout(req,res,next) {
        req.app.locals.role = 0;
        req.session.destroy(() => {
            res.render('students/login',{
                layout:false,
            });
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
                    req.app.locals.idUser = user._id;
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
}

module.exports = new StudentController;