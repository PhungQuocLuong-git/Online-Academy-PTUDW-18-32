const { mongooseToObject, multipleMongooseToObject } = require('../../util/mongoose');
const Student = require('../models/Student');
const Process = require('../models/Process');

module.exports = {
    profile(req, res, next) {
        const url = req.url + '';
        res.render('users/edit-profile', {
            url: url,
        });
    },
    account(req, res, next) {
        const url = req.url + '';
        res.render('users/edit-account', {
            script: '/public/stylesheets/form.css',
            url: url,
        });
    },
    async watchlist(req, res, next) {
        const url = req.url + '';

        // const list = req.session.user.wish_courses;

        const student = await Student.findById(req.session.user._id).populate({
            path: "wish_courses.course_id",
            select: "_id name slug price course_author short_description rating thumbnail",
            populate: { path: "course_author", select: "name" },

        })
        // console.log(student.wish_courses);


        res.render('users/watch-list', {
            script: '/public/javascripts/home.js',
            url: url,
            extraStyle: '/public/stylesheets/home.css',
            list: student.wish_courses,

        });
    },
    async registeredcourses(req, res, next) {
        const url = req.url + '';
        var student = await Student.findById(req.session.user._id).populate({
            path: "booked_courses.course_id",
            select: "name slug price course_author thumbnail curriculum",
            populate: { path: "course_author", select: "name" },
            populate: { path: "curriculum", select: "lectures" }

        })

        var courses = student.booked_courses;
        courses = multipleMongooseToObject(courses);

        for (var i = 0; i < courses.length; i++) {
            var pro = await Process.findOne({ student_id: req.session.user._id, course_id: courses[i].course_id._id });
            courses[i]['numlesson'] = 0;
            courses[i]['progress'] = 0;
            courses[i]['percent'] = 0;
            if (pro !== null) {
                var lenlec=0;

                for (var j = 0; j < courses[i].course_id.curriculum.length; j++) {
                    lenlec=lenlec+ courses[i].course_id.curriculum[j].lectures.length;
                }
                courses[i]['numlesson'] = lenlec;


                courses[i]['progress'] = pro.process.length;
                courses[i]['percent'] = pro.process.length / lenlec * 100;

            }

        }
        // console.log(courses[courses.length-1].course_id.curriculum[0].lectures.length);
        // console.log(courses);
        res.render('users/registered-courses', {
            script: '/public/javascripts/home.js',
            /* progress: '10',
            numlesson: '25',
            percent: +'10' / +'25' * 100, */
            url: url,
            list: courses,
        });
    },

    async removefromwishlist(req, res) {
        const id = req.params.id;
        const student = await Student.find({ "_id": req.session.user._id, "wish_courses.course_id": id });
        const len = student.length;

        // console.log("saaaaaaaaaaaaaaaa"+student);
        if (len > 0) {
            var wishlist = await Student.updateOne(
                { _id: req.session.user._id },
                { $pull: { wish_courses: { course_id: id } } }
            );
        }
        else {
            var wishlist = await Student.updateOne(
                { _id: req.session.user._id },
                { $push: { wish_courses: { course_id: id } } }

            );
        }
        console.log(len);


    }



};

