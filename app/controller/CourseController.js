const Course = require('../models/Course');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Category = require('../models/Category');
const Subategory = require('../models/Subcategory');
const Rate = require('../models/Rate');

const { mongooseToObject, multipleMongooseToObject } = require('../../util/mongoose');
const { collection } = require('../models/Course');
const multer = require('multer');
const Curriculum = require('../models/Curriculum');

module.exports = {
    async listlevel1(req, res) {
        var slug = req.params.slug;
        var catid = await Category.find({ slug: slug });

        var len = catid.length;
        if (len === 0) {
            res.render('courses/list', {
                script: '/public/javascripts/home.js',
                isvalid: 1,
            });
        }
        else {
            catid = catid[0];
            var list = await Course.find({ catid: catid._id }).populate('course_author');
            res.render('courses/list', {
                script: '/public/javascripts/home.js',
                isvalid: 0,
                list: list,
                name: catid.CatName,
                empty: list.length,
                extraStyle: '/public/stylesheets/home.css'
            });
        }

    },
    async listlevel2(req, res) {

        var slug1 = req.params.slug1;
        var slug2 = req.params.slug2;
        var catid = await Category.find({ slug: slug1 });
        var subcatid = await Subategory.find({ slug: slug2 });

        var len1 = catid.length;
        var len2 = subcatid.length;
        if (len1 === 0 || len2 === 0) {
            res.render('courses/list', {
                script: '/public/javascripts/home.js',
                isvalid: 1,
            });
        }
        else {

            var list = await Course.find({ subcatid: subcatid[0]._id }).populate('course_author');
            res.render('courses/list', {
                script: '/public/javascripts/home.js',
                isvalid: 0,
                list: list,
                name: subcatid[0].SubCatName,
                empty: list.length,
                extraStyle: '/public/stylesheets/home.css'
            });
        }

    },

    search(req, res) {
        res.render('courses/search', {
            script: '/public/javascripts/home.js'
        });
    },

    async detail(req, res, next) {
        try {
            var course = await (await Course.findOne({ slug: req.params.slug }).populate('curriculum course_author rates'));
            //console.log(course.curriculum);
            var isBooked = course.course_students.some(student => student.user_id.equals(req.session.user._id));
            res.render('courses/detail', {
                course: mongooseToObject(course),
                extraStyle: '/public/stylesheets/home.css',
                script: '/public/javascripts/home.js',
                isBooked,
                isTeacher: req.session.role === 2
            });
            course.view++;
            await Course.updateOne({ slug: course.slug }, course);
        } catch (err) {
            res.json({ msg: 'Something happened!!!' });
        }
    },

    create(req, res) {
        res.render('courses/create', {
            layout: false,
        })
    },
    fts(req, res) {
        var options = {};
        var sortOption = {};
        if (req.query.rating) {
            const rate = +req.query.rating;
            options.rating = { $gte: rate };
        }
        if (req.query.price) {
            const price = +req.query.price;
            options.price = { $gte: price };
        }
        // if(req.query.field){
        //     sortOption.field
        // }
        sortOption.field = "price";
        sortOption.type = 1;
        Course.find({ $text: { $search: req.query.kw } }).find(options).sortable(req).populate('course_author course_students')
            .then(courses => res.render('courses/search', {
                courses: multipleMongooseToObject(courses)
            }))
            .catch(error => console.error(error));
    },

    async store(req, res, next) {
        const storage = multer.diskStorage({
            destination: function (req, file, cb) {
                if (file.originalname.includes('.mp4')) {
                    cb(null, './public/videos/');
                }
                if (file.originalname.includes('.pdf')) {
                    cb(null, './public/documents/');
                }
                if (file.originalname.includes('.png') || file.originalname.includes('.jpg') || file.originalname.includes('.gif')) {
                    cb(null, './public/images/courses/');
                }
            },
            filename: function (req, file, cb) {
                cb(null, file.originalname);
            }
        });
        const upload = multer({ storage });

        //console.log(req.query);
        //Tao input cho multer fields
        var inputArr = [{ name: 'thumbnail', maxcount: 1 }, { name: 'preview_vid', maxcount: 1 }];
        for (let i = 1; i <= +req.query.num; i++) {
            if (req.query[`chapter${i}`] !== 'undefined') {
                inputArr.push({ name: `lec_chapter${i}_content`, maxcount: 10 });
            }
        }
        //console.log(inputArr);

        upload.fields(inputArr)(req, res, async function (err) {
            if (err) {
                console.log(err);
            }
            else {
                //console.log(req.body);
                //console.log(req.files);
                req.body.course_author = req.session.user._id;
                req.body.thumbnail = `/public/images/courses/${req.files.thumbnail[0].originalname}`;
                req.body.preview_video = `/public/videos/${req.files.preview_vid[0].originalname}`;
                req.body.curriculum = [];
                for (let i = 1; i <= +req.query.num; i++) {

                    if (req.query[`chapter${i}`] !== 'undefined') {
                        let previewArr = [];
                        for (let j = 1; j <= +req.query[`chapter${i}`]; j++) {
                            if (typeof (req.body[`lec${j}_chapter${i}_preview`]) !== 'undefined') {
                                previewArr.push(req.body[`lec${j}_chapter${i}_preview`]);
                            }
                        }
                        //console.log(previewArr);
                        var object = { chapter_name: req.body.chapter_name[i - 1], lectures: [] };       //Lecture
                        if (+req.query[`chapter${i}`] > 1) {
                            for (let j = 1; j <= +req.query[`chapter${i}`]; j++) {                  //Xử lý nội dung lecture
                                if (typeof (req.body[`lec_chapter${i}_name`][j - 1]) !== 'undefined') {
                                    let description = '', link = '';
                                    if (typeof (req.body[`lec_chapter${i}_des`]) !== 'undefined')
                                        description = req.body[`lec_chapter${i}_des`][j - 1];
                                    if (req.body[`lec_chapter${i}_content`][j - 1] === 'yes') {
                                        link = '/public/videos/' + req.files[`lec_chapter${i}_content`][0].originalname;
                                        req.files[`lec_chapter${i}_content`].shift();
                                    }
                                    object.lectures.push({
                                        name: req.body[`lec_chapter${i}_name`][j - 1],
                                        description,
                                        link,
                                        preview: previewArr[j - 1]
                                    });
                                }
                            }
                        }
                        if (+req.query[`chapter${i}`] === 1) {                               //Xử lý nội dung lecture nếu lecture chỉ có 1 trong chapter
                            let description = '', link = '';
                            if (typeof (req.body[`lec_chapter${i}_des`]) !== 'undefined')
                                description = req.body[`lec_chapter${i}_des`];
                            if (req.body[`lec_chapter${i}_content`] === 'yes')
                                link = '/public/videos/' + req.files[`lec_chapter${i}_content`][0].originalname;
                            object.lectures.push({
                                name: req.body[`lec_chapter${i}_name`],
                                description,
                                link,
                                preview: previewArr[0]
                            })
                        }
                        const curr = new Curriculum(object);
                        curr.save();
                        req.body.curriculum.push({ _id: curr.id });
                    }
                }
                const course = new Course(req.body);
                course.save();
                var teacher = await Teacher.findOne({ _id: req.session.user._id });
                teacher.posted_courses.push({ course_id: course.id });
                await Teacher.updateOne({ _id: teacher._id }, teacher);
                res.redirect('/');
            }
        });
    },

    delete(req, res, next) {

        Course.findByIdAndUpdate(req.body.courseID, { status: -1 })
            .then(() => res.status(200).send('true'))
            .catch(() => res.status(200).send('false'))
    },

    restore(req, res, next) {

        Course.findByIdAndUpdate(req.body.courseID, { status: 0 })
            .then(() => res.status(200).send('true'))
            .catch(() => res.status(200).send('false'))
    },


    async destroy(req, res, next) {

        //let course = await Course.remove({_id:req.body.courseID});
        console.log(req.body.courseID);
        let ok = await Student.updateMany(
            { "wish_courses.course_id": req.body.courseID },
            { $pull: { wish_courses: { course_id: req.body.courseID } } },
            (err, data) => {
                if (err) {

                    res.status(200).send('false');
                }
                else {

                    res.status(200).send('true');
                }
            });

    },


    //[POST]/courses/add/:id
    add(req, res, next) {
        Student.findById(req.session.user._id).populate("cart_courses.course_id")
            .then(user => {
                return new Promise(function (resolve, reject) {
                    if (user.cart_courses.some(course => course.course_id.equals(req.params.id)) ||
                        user.booked_courses.some(course => course.course_id.equals(req.params.id))) {
                        reject(user);
                    }
                    else
                        resolve(user);
                })
            })
            .then(user => {
                user.cart_courses.push({ course_id: req.params.id });
                req.session.user = mongooseToObject(user);
                req.app.locals.user = mongooseToObject(user);
                return Student.findByIdAndUpdate(req.session.user._id, user).populate("cart_courses.course_id")
            })
            .then(user => {
                user.cart_courses.push({ course_id: req.params.id });
                return Student.findByIdAndUpdate(req.session.user._id, user).populate("cart_courses.course_id")
            })
            .catch(user => {
                res.json({ msg: 'fail', user });
            })
            .then(user => {
                req.session.user = mongooseToObject(user);
                req.app.locals.user = mongooseToObject(user);
                res.redirect('/student/cart/' + user._id);
            })
    },

    book(req, res, next) {

        Course.findById(req.params.id).populate('course_students.user_id')
            .then(course => {
                return new Promise(function (resolve, reject) {
                    if (
                        course.course_students.some(course => course.user_id.equals(req.session.user._id))) {
                        reject(course)
                    }
                    else
                        resolve(course);
                })
            })
            .catch(course => {
                res.json({ msg: 'fail', course })
            })
            .then(course => {
                return new Promise(function (resolve, reject) {
                    // res.json(req.session.user.cart_courses.findIndex(cours => cours.course_id.equals(req.params.id)))
                    var ret = req.session.user.cart_courses.findIndex(cours => cours.course_id._id.equals(req.params.id));
                    if (course.price > req.session.user.money)
                        reject();
                    else {
                        resolve([ret, course]);
                    }
                })
            }
            )
            .then(([ret, course]) => {
                if (ret >= 0 && req.session.user.cart_courses.length > 0) {
                    req.session.user.cart_courses.splice(ret, 1);
                }
                course.course_students.push({ user_id: req.session.user._id });
                req.session.user.booked_courses.push({ course_id: course._id });
                req.session.user.money -= course.price;
                return Promise.all([Course.findByIdAndUpdate(course._id, course),
                Student.findByIdAndUpdate(req.session.user._id, req.session.user).populate({
                    path: "cart_courses.course_id",
                    select: "name slug price course_author",
                    populate: { path: "course_author", select: "name" },

                })])
            })
            .then(([course, user]) => {
                req.app.locals.user = mongooseToObject(user);
                res.redirect('/student/cart/' + user._id);
            })
            .catch(() => {
                res.json({ msg: 'Bn k mua dc khoa hc nay' });
            })
    },

    //[POST]/courses/wish/:id
    wish(req, res, next) {
        // res.json({msg:req.params.id});
        console.log('wish');
        Student.findById(req.session.user._id).populate('wish_courses')
            .then(user => {
                let wished = false;
                let i = 0;
                let j = 0;
                user.wish_courses.forEach(wish => {
                    if (wish.course_id.equals(req.params.id)) {
                        wished = true;
                        j = i;
                    }
                    i++;
                });
                if (wished)
                    user.wish_courses.splice(j, 1);
                else
                    user.wish_courses.push({ course_id: req.params.id });

                Student.updateOne({ _id: req.session.user._id }, user)
                    .then(res.redirect('/user/watch-list'));
            })
    },

    async wished(req, res) {
        var user = await Student.findById(req.session.user._id).populate('wish_courses');
        var isWished = user.wish_courses.some(course => course.course_id.equals(req.query.id));
        if (isWished) {
            res.json(true);
        }
        else res.json(false);
    },

    async storeRate(req, res) {
        var course = await Course.findOne({ slug: req.params.slug });
        var rate = await Rate.findOne({ course_id: course._id, student_id: req.session.user._id });
        // console.log(course);
        // console.log(rate);
        // console.log(req.body);
        if (rate === null) {
            rate = new Rate({
                course_id: course._id,
                student_id: req.session.user._id,
                student_name: req.session.user.name,
                student_avatar: req.session.user.avatar,
                rate_value: req.body.rate_value,
                comment: req.body.comment
            });
            rate.save();
            course.rates.push({ _id: rate.id });
            if (course.rating === '0') {
                course.rating = rate.rate_value;
                console.log(course.rating);
            }
            else {
                course.rating = (((+course.rating) * (course.rates.length - 1) + (+rate.rate_value)) / course.rates.length).toFixed(2);
            }
        }
        else {
            let prevRate_value = +rate.rate_value;
            rate.rate_value = req.body.rate_value;
            rate.comment = req.body.comment;
            course.rating = (+course.rating - (prevRate_value - (+rate.rate_value)) / course.rates.length).toFixed(2);
            console.log(course.rating);
            await Rate.updateOne({ course_id: course._id, student_id: req.session.user._id }, rate);
        }
        await Course.updateOne({ slug: req.params.slug }, course);

        res.redirect(req.get('Referrer'));
    },

    delcart(req, res, next) {
        res.json({ msg: req.params.id });
    },

    //Most viewed courses
    async getMostviewed() {
        var courses = await Course.find().populate('course_author');
        courses.sort((course1, course2) => { course1.view - course2.view });
        // editedCourses=courses.slice(0,10);
        editedCourses = {
            first_3: multipleMongooseToObject(courses.slice(0, 3)),
            next_3: multipleMongooseToObject(courses.slice(3, 6)),
            last_3: multipleMongooseToObject(courses.slice(6, 9)),
            last_1: mongooseToObject(courses[9])
        }
        //...mongooseToObject(courses[9])
        return editedCourses;
    },
    //Most popular courses
    getMostpopular() {

    },
    //Most highligted courses
    getMostHighlighted() {

    },
    //Newest courses
    getNewest() {

    },
};

