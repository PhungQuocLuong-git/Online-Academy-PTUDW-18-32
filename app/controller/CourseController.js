const Course = require('../models/Course');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Category = require('../models/Category');
const Subcategory = require('../models/Subcategory');
const Bookdetail = require('../models/Bookdetail');
const Subategory = require('../models/Subcategory');
const moment = require("moment-timezone");
const Rate = require('../models/Rate');
const Curriculum = require('../models/Curriculum');


const { mongooseToObject, multipleMongooseToObject } = require('../../util/mongoose');
// const { collection } = require('../models/Course');
const multer = require('multer');

async function getMostPurchasedRelated(course_subCatid) {
    var courses = await Course.find({ subcatid: course_subCatid }).populate('course_author course_students');
    courses.sort((course1, course2) => { return course2.course_students.length - course1.course_students.length });
    var mostRelatedPurchased = multipleMongooseToObject(courses.slice(0, 6));
    return mostRelatedPurchased;
}

module.exports = {
    courses(req, res) {
        res.redirect('/courses/list/all-courses');
    },
    search(req, res) {
        res.render('courses/search', {
            script: '/public/javascripts/home.js'
        });
    },

    async detail(req, res, next) {
        // try {
        var course = await Course.findOne({ slug: req.params.slug}).populate('curriculum course_author course_students rates posted_courses');
        var isBooked = false;
        var isStudent;
        if (req.session.role === 1) {
            isBooked = course.course_students.some(student => student.user_id.equals(req.session.user._id));
            isStudent = course.course_students.some(student => student.user_id.equals(req.session.user._id));
        }
        if (req.session.role === 2 || req.session.role === 3) {
            isBooked = true;
            isStudent = false;
        }
        var mostRelatedPurchased = await getMostPurchasedRelated(course.subcatid);
        mostRelatedPurchased = mostRelatedPurchased.filter(a => !a._id.equals(course._id));
        res.render('courses/detail', {
            course: mongooseToObject(course),
            script: '/public/javascripts/home.js',
            isBooked,
            isTeacher: req.session.role === 2,
            mostRelatedPurchased,
            isStudent
        });
        course.view++;
        await Course.updateOne({ slug: course.slug }, course);
        // } catch (err) {
        //      console.error(err);
        // }
    },

    async isown(req, res, next) {


        try {
            var course = await Course.findOne({ slug: req.params.slug }).populate('curriculum');
            if (course.course_author + '' === req.session.user._id + '') {
                next();
            }
            else {
                res.render('404', {
                    script: 'Bạn không sở hữu khoá học này!',
                    layout: false,
                });
            }


        } catch (err) {
            res.render('404', {
                script: 'Không tìm thấy khoá học!',
                layout: false,
            });
        }

    },

    async edit(req, res) {
        {
            var course = await Course.findOne({ slug: req.params.slug }).populate('curriculum');
            res.render('courses/edit', {
                layout: 'teacher',
                course: mongooseToObject(course),
                script: '/public/javascripts/home.js',
            });
        }
    },

    async renamechap(req, res) {
        var slug = req.params.slug + '';
        var idchapter = req.params.idchapter;
        var url = '/courses/edit/' + slug;
        var cur = await Curriculum.findOneAndUpdate(
            { _id: idchapter },
            { chapter_name: req.body.name }
        )


        res.redirect(url);

    },
    async complete(req, res) {

        var slug = req.params.slug;
        var course = await Course.findOneAndUpdate(
            { slug: slug },
            { complete: +req.body.complete }
        )


        var url = '/courses/edit/' + slug;

        res.redirect(url);

    },


    async general(req, res) {

        var slug = req.params.slug;
        var course = await Course.findOneAndUpdate(
            { slug: slug },
            { description: req.body.description, discount_price: req.body.discount_price }
        )


        var url = '/courses/edit/' + slug;

        res.redirect(url);

    },

    async deletechap(req, res) {
        var slug = req.params.slug + '';
        var idchapter = req.params.idchapter;
        var idcourse = req.params.idcourse;
        var url = '/courses/edit/' + slug;
        var cur = await Curriculum.deleteOne({ _id: idchapter });
        //console.log(cur);
        var course = await Course.findOneAndUpdate(
            { _id: idcourse },
            { $pull: { curriculum: idchapter } }
        );


        res.redirect(url);

    },

    async addchapter(req, res) {

        var slug = req.params.slug + '';
        // console.log(req.body);
        var url = '/courses/edit/' + slug;
        var cur = req.body;
        cur.lectures = [];
        const instance = new Curriculum(cur);
        instance.save(function (err) {
        });
        //console.log(instance._id);
        var updatedcourser = await Course.updateOne(
            { slug: req.params.slug },
            { $push: { curriculum: { '_id': instance._id } } },
            { upsert: true, new: true }
        );


        res.redirect(url);
    },

    async addletter(req, res) {

        var slug = req.params.slug + '';
        var idchapter = req.params.idchapter;
        // console.log(req.body);
        var url = '/courses/edit/' + slug;
        const storage = multer.diskStorage({
            destination: function (req, file, cb) {
                if (file.originalname.includes('.mp4')) {
                    cb(null, './public/videos/');
                }
            },
            filename: function (req, file, cb) {
                cb(null, Date.now() + '-' + file.originalname);
            }
        });
        const upload = multer({ storage });
        upload.fields([
            { name: 'name', maxCount: 1 },
            { name: 'letter-vid', maxCount: 1 }
        ])(req, res, async function (err) {
            if (err) {
                res.send("loi");
                console.log(err);
            }
            else {
                // console.log(req.files['letter-vid'][0].filename);
                // console.log(req.letter-vid.filename);
                var link = '/public/videos/' + req.files['letter-vid'][0].filename;
                var cur = await Curriculum.findOneAndUpdate(
                    { _id: idchapter },
                    { $push: { lectures: { name: req.body.name, description: "", link: link, preview: 0 } } }
                );
                // console.log(cur);

                res.redirect(url);
            }
        });


    },


    async changeimg(req, res) {

        var slug = req.params.slug + '';


        var url = '/courses/edit/' + slug;
        const storage = multer.diskStorage({
            destination: function (req, file, cb) {
                if (file.originalname.includes('.png') || file.originalname.includes('.jpg') || file.originalname.includes('.gif')) {
                    cb(null, './public/images/courses/');
                }
            },
            filename: function (req, file, cb) {
                cb(null, Date.now() + '-' + file.originalname);
            }
        });
        const upload = multer({ storage });
        upload.fields([
            { name: 'img-course', maxCount: 1 },

        ])(req, res, async function (err) {
            if (err) {
                res.send("loi");
                console.log(err);
            }
            else {

                var link = '/public/images/courses/' + req.files['img-course'][0].filename;
                var course = await Course.findOneAndUpdate(
                    { slug: slug },
                    { thumbnail: link }
                );
                // console.log(cur);

                res.redirect(url);
            }
        });


    },

    create(req, res) {
        res.render('courses/create', {
            layout: 'teacher',
        })
    },

    getSubByCatId(req, res) {
        Subcategory.find({ CatID: req.query.catId })
            .then(result => res.json(result))
            .catch(() => res.send('false'));

    },

    fts(req, res) {
        var options = {};
        var sortOption = {};
        var wordSearch = '';
        if (req.query.kw)
            wordSearch = req.query.kw.trim().replace(/\s+/g, ' ');
        if (req.query.rating) {
            const rate = +req.query.rating;
            options.rating = { $gte: rate };
        }
        if (req.query.price) {
            const price = +req.query.price;
            options.price = { $gte: price };
        }
        if (req.query.category)
            options.catid = req.query.category;
        if (req.query.subcategory)
            options.subcatid = req.query.subcategory;

        var page = (req.query.p) ? req.query.p : 1;
        var paginateOption = {
            page,
            limit: 5
        }
        if (req.query.hasOwnProperty('field')) {
            paginateOption.sort = { [req.query.field]: req.query.type }
        }
        options.$or = [{ $text: { $search: wordSearch } }, { name: { $regex: wordSearch, $options: 'i' } }];
        // Course.find({$text: {$search: req.query.kw} }).find(options).sortable(req).populate('course_author course_students')
        Course.paginate(options, paginateOption)
            // Course.find().pretty()
            .then(courses => res.render('courses/search', {
                courses: courses.docs,
                pagination: {
                    page,
                    pageCount: Math.ceil(courses.total / courses.limit)
                },
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

        // console.log(req.query);
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
               // console.log(req.body);
                //console.log(req.files);
                req.body.course_author = req.session.user._id;
                req.body.discount_price = !req.body.discount_price || req.body.discount_price > req.body.price ? req.body.price : req.body.discount_price;
                req.body.thumbnail = `/public/images/courses/${req.files.thumbnail[0].originalname}`;
                if (typeof (req.files.preview_vid) === undefined)
                    req.body.preview_video = `/public/videos/${req.files.preview_vid[0].originalname}`;
                // else
                //     req.body.preview_video="";
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
                        var object;
                        if (typeof (req.body.chapter_name[0]) !== undefined) {
                            if (Array.isArray(req.body.chapter_name)) {
                                object = { chapter_name: req.body.chapter_name[0], lectures: [] };    //Lecture
                                req.body.chapter_name.shift();
                            }
                            else
                                object = { chapter_name: req.body.chapter_name, lectures: [] };
                        }
                        else
                            object = { chapter_name: "", lectures: [] };
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
                        //console.log(object);
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

        //console.log(req.body.courseID);
        await Student.updateMany(
            { "wish_courses.course_id": req.body.courseID },
            { $pull: { wish_courses: { course_id: req.body.courseID } } },
            (err, data) => {
                if (err) {

                    // res.status(200).send('false');
                }
                else {

                    // res.status(200).send('true');
                }
            });
        await Student.updateMany(
            { "cart_courses.course_id": req.body.courseID },
            { $pull: { cart_courses: { course_id: req.body.courseID } } },
            (err, data) => {
                if (err) {

                    // res.status(200).send('false');
                }
                else {

                    // res.status(200).send('true');
                }
            });
        await Student.updateMany(
            { "booked_courses.course_id": req.body.courseID },
            { $pull: { booked_courses: { course_id: req.body.courseID } } },
            (err, data) => {
                if (err) {

                    // res.status(200).send('false');
                }
                else {

                    // res.status(200).send('true');
                }
            });
        await Course.remove({ _id: req.body.courseID },
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
        // res.json(req.session.user._id)
        // Course.findOne({_id:req.params.id})
        // .then(course => {console.log(course.course_students,'a',course)
        //     console.log(course.course_students.includes(req.session.user._id)) ;}
        // )

        Course.findById(req.params.id).populate('course_students')
            .then(course => {
                return new Promise(function (resolve, reject) {
                    if (course.course_students.some(course => course.user_id.equals(req.session.user._id))) {
                        reject(course)
                    }
                    else
                        resolve(course);
                })
            })
            .catch(course => {
                res.json({ msg: 'fail', course });
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
            .then(async ([ret, course]) => {
                if (ret >= 0 && req.session.user.cart_courses.length > 0) {
                    req.session.user.cart_courses.splice(ret, 1);
                }
                let teacher = await Teacher.findById(course.course_author);
                teacher.NumOfStudents = teacher.NumOfStudents + 1;
                await Teacher.findByIdAndUpdate(course.course_author, teacher);
                course.course_students.push({ user_id: req.session.user._id });
                req.session.user.booked_courses.push({ course_id: course._id });
                req.session.user.money -= course.price;
                const instance = new Bookdetail({ course_id: course._id, student_id: req.session.user._id, catid: course.catid, subcatid: course.subcatid });
                instance.save(function (err) {
                });
                return Promise.all([Course.findByIdAndUpdate(course._id, course),
                Student.findByIdAndUpdate(req.session.user._id, req.session.user).populate({
                    path: "cart_courses.course_id",
                    select: "name slug price course_author",
                    populate: { path: "course_author", select: "name" },

                })])
            })
            .then(([course, user]) => {
                req.app.locals.user = mongooseToObject(user);
                res.redirect(req.get('referer'));
            })
            .catch(() => {
                res.json({ msg: 'Bn k mua dc khoa hc nay'});
            })
    },

    // book(req,res,next){
    //         Course.findOne({_id:req.params.id})
    //     .then(course => {console.log(course.course_students,'a',course)
    //         console.log(course.course_students.indexOf(req.session.user._id)) ;}
    //     )
    //     // Course.findById(req.params.id)
    //     //     .then(course => {
    //     //         if(course.course_students.includes)
    //     //         {}
    //     //     })
    // },

    //[POST]/courses/wish/:id
    wish(req, res, next) {
        // res.json({msg:req.params.id});
        //console.log('wish');
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
            rate.student_avatar = req.session.user.avatar;
            course.rating = (+course.rating - (prevRate_value - (+rate.rate_value)) / course.rates.length).toFixed(2);
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
        courses.sort(function (course1, course2) { return course2.view - course1.view });
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

    //Most popular category
    async getMostpopular(res) {
        dateFrom = moment().subtract(7, 'd');
        var listbooked = await Bookdetail.find({ "createdAt": { $gte: dateFrom } });
        var listsub = await Subcategory.find({}).populate("CatID");
        listsub = multipleMongooseToObject(listsub);
        var listcate = res.locals.lcCategories;

        var lencate = listcate.length;
        var lenbooked = listbooked.length;
        var lensub = listsub.length;
        for (var i = 0; i < lencate; i++) {
            listcate[i]['count'] = 0;
        }
        for (var i = 0; i < lensub; i++) {
            listsub[i]['count'] = 0;
        }
        for (var i = 0; i < lenbooked; i++) {
            for (var j = 0; j < lencate; j++) {
                if (listbooked[i].catid == listcate[j]._id) {
                    listcate[j]['count'] += 1;
                }
            }
            for (var e = 0; e < lensub; e++) {
                if (listbooked[i].subcatid == listsub[e]._id) {
                    listsub[e]['count'] += 1;
                }
            }
        }

        listcate.sort(function (a, b) { return b.count - a.count });
        listcate = listcate.slice(0, 5);

        while (listcate.length > 0 && listcate[listcate.length - 1].count === 0) {
            listcate = listcate.slice(0, listcate.length - 1);
        }
        listsub.sort(function (a, b) { return b.count - a.count });
        listsub = listsub.slice(0, 5);

        while (listsub.length > 0 && listsub[listsub.length - 1].count === 0) {
            listsub = listsub.slice(0, listsub.length - 1);
        }
        // temp=temp.slice(0,0);



        // console.log(list[0]);

        // console.log(list);
        return [listcate, listsub];
    },

    //Most highligted courses
    async getMostHighlighted() {
        dateFrom = moment().subtract(7, 'd');
        var listrate = await Rate.find({ "createdAt": { $gte: dateFrom } });
        listrate = multipleMongooseToObject(listrate);
        var lenlistrate = listrate.length;
        var listcourse = [];
        for (var i = 0; i < lenlistrate; i++) {
            if (!listcourse.includes(listrate[i].course_id))
                listcourse.push(listrate[i].course_id);
        }

        // console.log(listcourse);
        var courses = await Course.find({ _id: { $in: listcourse } });
        courses = multipleMongooseToObject(courses);
        var lencourses = courses.length;

        for (var i = 0; i < lencourses; i++) {
            courses[i]['ratethisweek'] = 0;
            courses[i]['numratethisweek'] = 0;
            for (var j = 0; j < lenlistrate; j++) {
                if (listrate[j].course_id + "" === courses[i]._id + "") {

                    courses[i]['numratethisweek'] += 1;
                    courses[i]['ratethisweek'] += +listrate[j].rate_value;
                    // console.log(+listrate[j].rate_value);

                }
            }
            // console.log(courses[i]);
        }
        var inv = 1.0 / 0.5;
        for (var i = 0; i < lencourses; i++) {
            var temp = courses[i].ratethisweek / courses[i].numratethisweek;
            // console.log(temp);
            courses[i]['ratethisweek'] = Math.round(temp * inv) / inv;
        }

        courses.sort(function (course1, course2) { return course2.ratethisweek - course1.ratethisweek });
        // console.log(courses);


        // console.log(courses.slice(0, 3));
        return courses.slice(0, 3);
    },
    //Newest courses
    async getNewest() {
        var courses = await Course.find().populate('course_author').sort({ createdAt: -1 }).limit(10);
        // courses.sort((course1, course2) => { course1.view - course2.view });
        // editedCourses=courses.slice(0,10);
        /* for(var i=0;i<courses.length;i++)
        {
            console.log(courses[i].createdAt);
    
        } */
        editedCourses = {
            first_3: multipleMongooseToObject(courses.slice(0, 3)),
            next_3: multipleMongooseToObject(courses.slice(3, 6)),
            last_3: multipleMongooseToObject(courses.slice(6, 9)),
            last_1: mongooseToObject(courses[9])
        }
        //...mongooseToObject(courses[9])
        return editedCourses;
    },

    getMostPurchased() {

    },
    getPopById(req, res, next) {
        //console.log(req.query, 'abc');
        const have = +req.query.isSub;
        //console.log(typeof (have), have)
        option = {};
        if (+req.query.isSub)
            option.subcatid = req.query.id
        else
            option.catid = req.query.id
        Course.find(option).populate('course_author').sort({ view: -1 }).limit(6)
            .then(courses => {
               // console.log(courses);
                res.json(
                    multipleMongooseToObject(courses)
                )
            })
            .catch(() => res.json('false'));
    }
};

