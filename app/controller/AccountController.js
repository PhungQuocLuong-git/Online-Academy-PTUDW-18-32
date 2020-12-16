const Account = require('../models/Account');
const { mongooseToObject} = require('../../util/mongoose');

// Hash password
const bcrypt = require('bcrypt');
const saltRounds = 10;


class AccountController{

    // [GET] /account/create
    create(req,res) {
        
        // Account.find({}, function(err,accounts) {
        //     // if( !err) {res.json(accounts);
        //     //     return;
        //     // }
        //     // res.status(400).json({error: 'ERR!'});
        //     res.render('accounts/create');
        // })
        res.render('accounts/create',{
            layout:false,
        });
    }

    // [POST] /account/store
    store(req,res,next) {

        Promise.all([Account.findOne({username: req.body.username}),bcrypt.hash(req.body.password, saltRounds)])
            .then(([user,hash]) => {
                if(user) res.json({err:'Existed username'})
                else {
                    req.body.password= hash;
                    new Account(req.body).save()
                        .then (res.redirect('/'));
                    
                }
            });
            
        // res.json(req.body);

    }

    // [GET] /account/login
    login(req,res,next) {
        res.render('accounts/login',{
            layout:false,
        });
    }

    // [POST] /account/logout
    logout(req,res,next) {
        req.app.locals.isTeacher =false;
        req.app.locals.isAdmin = false;
        req.app.locals.isStudent = false;
        req.session.destroy(() => {
            res.render('accounts/login',{
                layout:false,
            });
          });
    }

    // [PATCH] /account/:id
    swap(req,res,next) {
        var roleSwap = 1;
        if(req.session.user.role===1){
            roleSwap = 2;
        }
        
        Account.updateOne({_id:req.params.id},{role:roleSwap})
            .then(() => {
                req.session.user.role = roleSwap;
                req.app.locals.user = req.session.user;
                switch(roleSwap){
                    case 1:
                        req.app.locals.isStudent = true;
                        req.app.locals.isTeacher = false;
                        break;
                    case 2:
                        req.app.locals.isTeacher = true;
                        req.app.locals.isStudent = false;
                        break;
                    case 3:
                        req.app.locals.isAdmin = true;
                        break;
                       }
                // res.json({msg:req.app.locals.user.role})
                res.redirect('/')
            });
    }

    // [POST] /account/check
    check(req,res,next) {
        Account.findOne({username: req.body.username})
            .then( user => {
                bcrypt.compare(req.body.password, user.password)
                .then(function(result) {
                    if(result)
                   {
                    req.app.locals.idUser = user._id ;
                    req.app.locals.user = user;
                    req.session.user = user;
                    req.session.username = req.body.username;
                    req.app.locals.nameUser = user.username;
                 //     console.log('Success login');
                
                     switch(user.role){
                         case 1:
                             req.app.locals.isStudent = true;
                             break;
                         case 2:
                             req.app.locals.isTeacher = true;
                             break;
                         case 3:
                             req.app.locals.isAdmin = true;
                             break;
                            }
                            // res.json({msg:"success"})
                    }
                   else {
                    res.redirect('/account/login');

                   }
                   res.redirect('/');
                });
            })
    }
}

module.exports = new AccountController;