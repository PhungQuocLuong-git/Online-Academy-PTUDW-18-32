const Teacher = require('../models/Teacher');
const { mongooseToObject, multipleMongooseToObject } = require('../../util/mongoose');
const multer = require('multer');
// Hash password
const bcrypt = require('bcrypt');
const Course = require('../models/Course');
const saltRounds = 10;


class TeacherController {
    // [GET] /Teacher/create
    create(req, res) {
        res.render('teachers/create', {
            layout: false,
        });
    }


    home(req, res) {
        res.render('teachers/teacher', {
            layout: 'teacher'
        });
    };
    async inprogresscourses(req, res) {

        var teacher = await Teacher.find(req.app.locals.user._id);
        var listidcourse = teacher[0].posted_courses;
        var len = listidcourse.length;
        var listid = [];
        console.log(len);
        for (var i = 0; i < len; i++) {
            listid.push(listidcourse[i].course_id);
        }

        var courses = await Course.find({ _id: { $in: listid }, complete: 0 });
        console.log(courses.length);
        res.render('teachers/inprogresscourses', {
            layout: 'teacher',
            courses: courses,
            title: "Inprogress courses"
        });
    };

    async completecourses(req, res) {

        var teacher = await Teacher.find(req.app.locals.user._id);
        var listidcourse = teacher[0].posted_courses;
        var len = listidcourse.length;
        var listid = [];
        console.log(len);
        for (var i = 0; i < len; i++) {
            listid.push(listidcourse[i].course_id);
        }

        var courses = await Course.find({ _id: { $in: listid }, complete: 1 });
        console.log(courses.length);
        res.render('teachers/inprogresscourses', {
            layout: 'teacher',
            courses: courses,
            title: "Complete courses"
        });
    };


    // [POST] /Teacher/store
    store(req, res, next) {
        Promise.all([Teacher.findOne({ username: req.body.username }), bcrypt.hash(req.body.password, saltRounds)])
            .then(([user, hash]) => {
                if (user) res.json({ err: 'Existed username' })
                else {
                    req.body.password = hash;
                    new Teacher(req.body).save()
                        .then(res.redirect('/'));

                }
            });

        // res.json(req.body);

    }
    change(req, res, next) {
        Teacher.findById(req.session.user._id)

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
                return Teacher.findByIdAndUpdate(req.session.user._id, { password: hash });
            })
            .then(user => {
                res.send("true")
            })
            .catch(err => console.log(err));
    }

    async censor(req, res) {
        if (req.body.type === 'ok')
            var status = 1;
        else
            var status = -1;


        let teacher = await Teacher.findByIdAndUpdate(req.body.idTeacher, { $set: { stt: status } });
        if (teacher) {
            res.send('true');
        }
        else
            res.send('false');

    }

    // [GET] /Teacher/login
    login(req,res,next) {
        req.session.prevURL=req.get('referer');
        res.render('teachers/login',{
            layout:false,
        });
    }

    // [POST] /Teacher/logout
    logout(req, res, next) {
        req.app.locals.role = 0;
        req.session.destroy(() => {
            res.redirect('/teacher/login');
        });
    }

    // [PATCH] /Teacher/:id
    swap(req, res, next) {
        var roleSwap = 1;
        if (req.session.user.role === 1) {
            roleSwap = 2;
        }

        Teacher.updateOne({ _id: req.params.id }, { role: roleSwap })
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
                    user= mongooseToObject(user);
                    if(result){
                    // req.app.locals.idUser = user._id ;
                    req.app.locals.user = user;
                    req.session.user = user;
                    req.session.username = req.body.username;
                    req.app.locals.nameUser = user.username;
                    req.session.role=2;
                    req.app.locals.role = 2;
                    req.session.role = 2;
                    res.redirect(req.session.prevURL)
                      } else {
                        res.render('teachers/login', {
                            layout: false,
                            err_message: 'Invalid password'
                        });
                    }
                })
                    .catch((err) => 
                    {
                        res.render('teachers/login', {
                            layout: false,
                            err_message:'Invalid username'
                        });
                    })
            })
            .catch(err => {
                res.render('teachers/login', {
                    layout: false,
                    err_message: 'Invalid username'
                });
            });
        // res.json(req.body)
    }

    update(req,res) {
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
                console.log(req.body);
                if(req.files.length!==0) {
                    req.body.avatar = '/public/images/avatars/' + req.files[0].originalname;
                    req.session.user.avatar = req.body.avatar;
                    req.app.locals.user.avatar = req.body.avatar;
                    if(req.session.user.avatar.includes('https://'))
                        fs.unlink('.'+req.session.user.avatar,(sth) => {
                            console.log(sth);
                    });
                }
                var user = await Teacher.findByIdAndUpdate(req.params.id, req.body)
                req.session.user.name = req.body.name;
                req.session.user.email = req.body.email;
                req.session.user.short_description = req.body.short_description;
                req.session.user.description = req.body.description;
                req.app.locals.user.name = req.body.name;
                req.app.locals.user.email = req.body.email;
                req.app.locals.user.short_description = req.body.short_description;
                req.app.locals.user.description = req.body.description;
                res.redirect('/');
            }
        });
    }

    async uploadedCourses(req,res) {
        var courses = await Course.find({status:0,course_author:req.session.user._id});
        res.render('teachers/courses',{
            courses
        })
    }
}

module.exports = new TeacherController;