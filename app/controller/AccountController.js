const Account = require('../models/Account');
const { multipleMongooseToObject} = require('../../util/mongoose');

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
            })

        // Account.findOne({username: req.body.username})
        //     .then( user => {if(user) res.json({err:'Existed username'})
        // else res.json({msg:' success'})});


        // success
        // bcrypt.hash(req.body.password, saltRounds)
        //     .then(function(hash) {
                // req.body.password= hash;
                // new Account(req.body).save();
                // res.redirect('/');
        // })
        //     .catch(function () {
        //         res.json({err: "failed hash"});
        //     })

        // Promise.all([bcrypt.hash(req.body.password, saltRounds),new Account(req.body).save()])
        //     .then(([hash, success])=> {req.body.password = hash;
        //     res.json({
        //         pass:req.body.password,
        //         object: req.body
        //     })})
        //     res.json({error: "Failed hash"});

        // const account = new Account(req.body);
        // account.save()
        //     .then(() => res.redirect('/'))
        //     .catch(error => {});
    }

    // [GET] /account/login
    login(req,res,next) {
        res.render('accounts/login',{
            layout:false,
        });
    }

    // [GET] /account/login
    check(req,res,next) {
        Account.findOne({username: req.body.username})
            .then( user => {
                bcrypt.compare(req.body.password, user.password)
                .then(function(result) {
                    if(result)
                   {
                       req.session.logined = true;
                       req.session.username = req.body.username;
                    //     console.log('Success login');
                   }
                   else {
                       res.send('err');
                   }
                   res.redirect('/');
                });
            })
    }
}

module.exports = new AccountController;