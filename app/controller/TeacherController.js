const Teacher = require('../models/Teacher');
const { mongooseToObject} = require('../../util/mongoose');

// Hash password
const bcrypt = require('bcrypt');
const saltRounds = 10;


class TeacherController{
    // [GET] /Teacher/create
    create(req,res) {
        res.render('teachers/create',{
            layout:false,
        });
    }

    // [POST] /Teacher/store
    store(req,res,next) {

        Promise.all([Teacher.findOne({username: req.body.username}),bcrypt.hash(req.body.password, saltRounds)])
            .then(([user,hash]) => {
                if(user) res.json({err:'Existed username'})
                else {
                    req.body.password= hash;
                    new Teacher(req.body).save()
                        .then (res.redirect('/'));
                    
                }
            });
            
        // res.json(req.body);

    }

    async censor(req,res) {
        if(req.body.type === 'ok')
            var status = 1;
        else
            var status = -1;
        

        let teacher = await Teacher.findByIdAndUpdate(req.body.idTeacher,{$set: { stt: 0 }});
        if(teacher){
            res.send('true');
        }
        else
            res.send('false');
        
    }

    // [GET] /Teacher/login
    login(req,res,next) {
        res.render('teachers/login',{
            layout:false,
        });
    }

    // [POST] /Teacher/logout
    logout(req,res,next) {
        req.app.locals.role = 0;
        req.session.destroy(() => {
            res.render('teachers/login',{
                layout:false,
            });
          });
    }

    // [PATCH] /Teacher/:id
    swap(req,res,next) {
        var roleSwap = 1;
        if(req.session.user.role===1){
            roleSwap = 2;
        }
        
        Teacher.updateOne({_id:req.params.id},{role:roleSwap})
            .then(() => {
                req.session.user.role = roleSwap;
                req.app.locals.user = req.session.user;
                req.app.locals.role = roleSwap;
                res.redirect('/')
            });
    }

    // [POST] /Teacher/check
    check(req,res,next) {
        Teacher.findOne({username: req.body.username,stt:1})
            .then( user => {
                bcrypt.compare(req.body.password,user.password).then((result)=>{
                    if(result){
                    req.app.locals.idUser = user._id ;
                    req.app.locals.user = user;
                    req.session.user = user;
                    req.session.username = req.body.username;
                    req.app.locals.nameUser = user.username;
                    req.session.role=2;
                    req.app.locals.role = 2;
                    req.session.role = 2;
                    res.redirect('/')
                      } else {
                        res.redirect('/teachers/login');
                      }
                    })
                    .catch((err)=>res.json({error1: err}))
                })
                .catch(err => res.json({err2: err}));
        // res.json(req.body)
    }
}

module.exports = new TeacherController;