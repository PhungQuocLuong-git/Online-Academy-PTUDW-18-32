const Student = require('../models/Student');
const Course = require('../models/Course');
const Bookdetail = require('../models/Bookdetail');
const mailer = require('../../util/mailer');
const { mongooseToObject } = require('../../util/mongoose');
const multer = require('multer');
const fs = require('fs');

// Hash password
const bcrypt = require('bcrypt');
// const { findByIdAndUpdate } = require('../models/Student');
const saltRounds = 10;


class StudentController {

    // [GET] /Student/create
    create(req, res) {
        res.render('students/create', {
            layout: false,
        });
    }

    // [POST] /Student/store
    store(req, res, next) {
        Promise.all([Student.findOne({ username: req.body.username }), bcrypt.hash(req.body.password, saltRounds)])
            .then(([user, hash]) => {
                if (user) {
                    return new Promise(function (resolve, reject) {
                        reject('existed username');
                    });
                }
                req.body.password = hash;
                const to = req.body.email;
                const subject = 'Xác thực OTP nhé';
                const randNumb = Math.floor(100000 + Math.random() * 900000);
                req.app.locals.otp = randNumb;
                req.app.locals.storeStudent = req.body;
                req.app.locals.times = 3;
                const body = `<h1> Vui lòng xác thực để đăng kí tài khoản </h1>Your OTP is ${randNumb} .`
                // res.json({to,subject,body});
                console.log('test', req.app.locals.otp, req.app.locals.times);

                return mailer.sendMail(to, subject, body);
            })
            .catch(error => res.status(404).json(error))
            .then(() => res.status(200).render('students/verify', {
                layout: false
            }))
    }

    // [POST] /student/check-otp
    checkOtp(req, res) {
        console.log(req.app.locals.otp, +req.body.otp, req.app.locals.times);
        if (req.app.locals.otp === +req.body.otp) {

            new Student(req.app.locals.storeStudent).save()
                .then(res.status(200).redirect('/student/login'))
                .catch(res.status(404).json('OOPS'));
        }

        else {
            req.app.locals.times = req.app.locals.times - 1;
            if (!req.app.locals.times)
                req.session.destroy(() => {
                    res.redirect('/student/create');
                })
            else
                res.render('students/verify', {
                    layout: false,
                });

        }
    }

    // [GET] /student/login
    login(req, res, next) {
        req.session.prevURL=req.get('referer');
        res.render('students/login', {
            layout: false,
        });
    }

    // [GET] /Student/cart/:id
    cart(req, res) {
        // res.json({msg:req.params.id});
        Student.findById(req.params.id).populate({
            path: "cart_courses.course_id",
            select: "name slug price course_author",
            populate: { path: "course_author", select: "name" },

        })
            .then(user => {
                req.app.locals.user = mongooseToObject(user);
                res.render('students/cart', {
                    student: mongooseToObject(user),
                    extraStyle: '/public/stylesheets/home.css',
                    script: '/public/javascripts/home.js'
                })
            });
    }

    // [POST] /Student/logout
    logout(req, res, next) {
        req.app.locals.role = 0;
        req.app.locals.user = {};
        req.session.destroy(() => {
            res.redirect('/');
        });
    }
    // [POST] /student/check
    check(req, res, next) {
        // res.json(req.body.password);
        Student.findOne({ username: req.body.username }).populate({
            path: "cart_courses.course_id",
            select: "name slug price description course_author",
            populate: { path: "course_author", select: "name" },
        })
            .then(user => {
                //console.log(user);
                if(user){

                    req.session.user = mongooseToObject(user);
                    req.app.locals.user = mongooseToObject(user);
                    return bcrypt.compare(req.body.password, user.password)
                }
                else return new Promise(function(resolve,reject){reject('invalid name')});
            })
            .then((result) => {
                console.log('?????abc')
                if (result) {
                    req.session.username = req.body.username;
                    req.session.role = 1;
                    req.app.locals.role = 1;
                    res.redirect(req.session.prevURL);
                } 
                else {
                    res.render('students/login', {
                        layout: false,
                        err_message:'Invalid username or password'
                    });
                }
            })
            .catch(err =>{
                console.log(err)
                res.render('students/login', {
                    layout: false,
                    err_message:'Invalid username or password'
                });
            })
    }

    // [PUT] /:id
    update(req, res, next) {
        const storage = multer.diskStorage({
            destination: function (req, file, cb) {
                cb(null, './public/images/avatars/');
            },
            filename: function (req, file, cb) {
                cb(null, file.originalname);
            }
        });
        const upload = multer({ storage });

        upload.array('avatar', 1)(req, res, async function (err) {
            if (err) {
                console.log(err);
            }
            else {
                if(req.files.length!==0) {
                    req.body.avatar = '/public/images/avatars/' + req.files[0].originalname;
                    req.session.user.avatar = req.body.avatar;
                    req.app.locals.user.avatar = req.body.avatar;
                    if(req.session.user.avatar.includes('https://'))
                        fs.unlink('.'+req.session.user.avatar,(sth) => {
                            console.log(sth);
                    });
                }
                var user = await Student.findByIdAndUpdate(req.params.id, req.body)
                req.session.user.name = req.body.name;
                req.session.user.email = req.body.email;
                req.app.locals.user.name = req.body.name;
                req.app.locals.user.email = req.body.email;
                res.redirect('/');
            }
        });

    }

    change(req, res, next) {
        Student.findById(req.session.user._id)

            .then(user => {
                console.log(req.body.oldPass, user);
                return bcrypt.compare(req.body.oldPass, user.password)
            })
            .then(ret => {
                if (ret)
                    return bcrypt.hash(req.body.newPass, saltRounds);
                else {
                    return new Promise(function (resolve, reject) {
                        res.send("false");
                        reject("ABCDEFGH");
                    })
                }
            }
            )
            .then(hash => {
                return Student.findByIdAndUpdate(req.session.user._id, { password: hash });
            })
            .then(user => {
                res.send("true")
            })
            .catch(err => console.log(err));
    }

    // [DELETE] /student//delcart/:id
    delcart(req, res, next) {
        Student.findById(req.session.user._id).populate({
            path: "cart_courses.course_id",
            select: "name slug price course_author",
            populate: { path: "course_author", select: "name" },

        })
            .then(user => {
                let i = 0;
                user.cart_courses.forEach(course => {
                    if (course.course_id.equals(req.params.id))
                        user.cart_courses.splice(i, 1);
                    i++;
                }

                )
                req.session.user = mongooseToObject(user);
                req.app.locals.user = mongooseToObject(user);

                Student.updateOne({ _id: req.session.user._id }, user)
                    .then(res.redirect(`/student/cart/${user._id}`));
            });
    }

    // [POST] /student//handle-form-actions
    async handleFormActions(req, res, next) {
        // res.json(req.body);
        var idCourses = req.body.courseIds;
        let user = await Student.findById(req.session.user._id).populate({
            path: "cart_courses.course_id",
            select: "name slug price course_author",
            populate: { path: "course_author", select: "name" },

        });
        switch (req.body.action) {
            case 'delete':
                idCourses.forEach(id => {
                    let i = 0;
                    user.cart_courses.forEach(course => {
                        if (course.course_id.equals(id)) { user.cart_courses.splice(i, 1); }
                        i++;
                    })
                })
                req.session.user = mongooseToObject(user);
                Student.updateOne({ _id: user.id }, user)
            case 'book':
                var total = +req.body.total;
                // res.json(req.session.user);
                if (total <= user.money) {
                    var courses = await Course.find({ _id: { $in: idCourses } }).populate('course_students')
                    let i = courses.length - 1;
                    courses.forEach(async function (course) {
                        const instance = new Bookdetail({ course_id: course._id, student_id: req.session.user._id, catid: course.catid, subcatid: course.subcatid });
                        instance.save(function (err) {
                        });
                        user.booked_courses.push({ course_id: course.id });
                        let i = 0;
                        user.cart_courses.forEach(course2 => {
                            if (course._id.equals(course2.course_id._id)) {
                                user.cart_courses.splice(i, 1);
                            }
                            i++;
                        })
                        course.course_students.push({ user_id: req.session.user._id });
                        let c = await Course.findByIdAndUpdate(course._id, course);
                    })
                    user.money -= total;
                    req.session.user = mongooseToObject(user);
                    req.app.locals.user = mongooseToObject(user);
                    let student = await Student.findByIdAndUpdate(req.session.user._id, user).populate({
                        path: "cart_courses.course_id",
                        select: "name slug price course_author",
                        populate: { path: "course_author", select: "name" },

                    });

                    if (student) {
                        res.redirect('/');
                    }
                }
                else {
                    res.json({ total, urm: user.money });
                }

        }
    }
}

module.exports = new StudentController;

