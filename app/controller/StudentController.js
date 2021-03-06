const Student = require('../models/Student');
const Course = require('../models/Course');
const Bookdetail = require('../models/Bookdetail');
const Process = require('../models/Process');
const mailer = require('../../util/mailer');
const { mongooseToObject } = require('../../util/mongoose');
const multer = require('multer');
const fs = require('fs');

// Hash password
const bcrypt = require('bcrypt');
const { error } = require('console');
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
        Promise.all([Student.findOne({ email: req.body.email }), bcrypt.hash(req.body.password, saltRounds)])
            .then(([user, hash]) => {
                if (user) {
                    return new Promise(function (resolve, reject) {
                        reject('Email đã tồn tại!');
                    });
                }
                else {
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
            }
            })
            .catch(err => {
                res.json(err);
            })
            .then(() => res.json('true'))
    }

    verify(req,res,next){
        res.status(200).render('students/verify', {
            layout: false
        })
    }

    // [POST] /student/check-otp
    checkOtp(req, res) {
        console.log('aaaaaaaaaaa');
        console.log(req.body)
        console.log(req.app.locals.otp, +req.body.otp, req.app.locals.times);
        if (req.app.locals.otp === +req.body.otp) {

            new Student(req.app.locals.storeStudent).save()
                .catch(err => {console.log(err);res.json('OOPS')})
                .then(student => {
                    console.log(student);
                    req.app.locals.role=1;
                    req.session.role=1;
                    req.app.locals.user= mongooseToObject(student);
                    req.session.user= mongooseToObject(student);

                    res.json('true');
                })
        }

        else {
            req.app.locals.times = req.app.locals.times - 1;
            if (!req.app.locals.times)
                req.session.destroy(() => {
                    res.json('false');
                })
            else
                {console.log('abcde');res.json(req.app.locals.times);}

        }
    }

    // [GET] /student/login
    login(req, res, next) {
        req.session.prevURL = req.get('referer');
        res.render('students/login', {
            layout: false,
        });
    }

    // [GET] /Student/cart/:id
    cart(req, res) {
        // res.json({msg:req.params.id});
        Student.findById(req.params.id).populate({
            path: "cart_courses.course_id",
            select: "name slug price course_author discount_price thumbnail",
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
    
    // [POST] /student/check
    async check(req, res, next) {
        let err = '';
        let user = await Student.findOne({ email: req.body.email }).populate({
            path: "cart_courses.course_id",
            select: "name slug price description course_author discount_price thumbnail",
            populate: { path: "course_author", select: "name" },
        })
        if(user){
            if(user.stt===2)
                err = 'You was blocked by Admin.'
            else{

                const result = await bcrypt.compare(req.body.password, user.password) ;
                if(result){
                    console.log('true');
                        req.session.role = 1;
                        req.app.locals.role = 1;
                        req.session.user = mongooseToObject(user);
                        req.app.locals.user = mongooseToObject(user);
                        res.json('true');
                }
                else err = 'Wrong password'
            }
        }
        else
            err ='Invalid email';
        if(err)
            res.json(err);

    }

    async updateprocess(req, res, next) {
        var courseid = req.params.courseid;
        var lectureid = req.params.lectureid;
        
        // console.log('aaaaaaaaaaaaaaaaaaaa', courseid, lectureid);;
        var fi= await Process.findOne({ student_id: req.session.user._id, course_id: courseid });
        if(fi===null)
        {
            const instancepro = new Process({ student_id: req.session.user._id, course_id: courseid });
            instancepro.save(function (err) {});
            var process = await Process.updateOne(
                { student_id: req.session.user._id, course_id: courseid },
                { $push: { process: lectureid } },
                { upsert: true }
            )
        }
        else{

            var flag=0;
            for(var i=0;i<fi.process.length;i++)
            {
                if(fi.process[i]+''===lectureid+'')
                {
                    flag=1;
                }
            }
            if(flag===0)
            {
    
                var process = await Process.updateOne(
                    { student_id: req.session.user._id, course_id: courseid },
                    { $push: { process: lectureid } },
                    { upsert: true }
                )
            }
        }
        
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
                if (req.files.length !== 0) {
                    req.body.avatar = '/public/images/avatars/' + req.files[0].originalname;
                    req.session.user.avatar = req.body.avatar;
                    req.app.locals.user.avatar = req.body.avatar;
                    if (req.session.user.avatar.includes('https://'))
                        fs.unlink('.' + req.session.user.avatar, (sth) => {
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
            .catch(err => res.json(err));
    }

    // [DELETE] /student//delcart/:id
    delcart(req, res, next) {
        Student.findById(req.session.user._id).populate({
            path: "cart_courses.course_id",
            select: "name slug price course_author discount_price thumbnail",
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
        console.log(req.body);
        
        if(typeof(req.body.courseIds) === 'string')
            req.body.courseIds = req.body.courseIds.split();

        var idCourses = req.body.courseIds;
        let user = await Student.findById(req.session.user._id).populate({
            path: "cart_courses.course_id",
            select: "name slug price course_author discount_price thumbnail",
                populate: { path: "course_author", select: "name" },

        });
        switch (req.body.action) {
            case 'delete':
                console.log('dltttt')
                idCourses.forEach(id => {
                    let i = 0;
                    user.cart_courses.forEach(course => {
                        if (course.course_id.equals(id)) { user.cart_courses.splice(i, 1); }
                        i++;
                    })
                })
                req.session.user = mongooseToObject(user);
                    req.app.locals.user = mongooseToObject(user);
                let user2 = await Student.updateOne({ _id: user.id }, user).populate({
                    path: "cart_courses.course_id",
                    select: "name slug price course_author thumbnail ",
                    populate: { path: "course_author", select: "name" },

                });
                if(user2)
                    res.redirect('/');

                break;
            case 'book':
                console.log('bokkkkkk')

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
                        select: "name slug price course_author thumbnail",
                        populate: { path: "course_author", select: "name" },

                    });

                    if (student) {
                        res.redirect('/');
                    }
                }
                else {
                    res.json({ total, urm: user.money });
                }
                break;

        }
    }

    async block(req,res){
        if (+req.body.blocked)
            var status = 1;
        else
            var status = 2;
        let student = await Student.findByIdAndUpdate(req.body.id, { $set: { stt: status } });
        if (student) 
            res.send('true');
        else
            res.send('false');
    }
}

module.exports = new StudentController;

