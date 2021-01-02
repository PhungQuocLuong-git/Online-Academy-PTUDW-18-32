const Student = require('../models/Student');

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

        const student = await Student.findById(req.session.user._id).populate({
            path: "booked_courses.course_id",
            select: "name slug price course_author thumbnail",
            populate: { path: "course_author", select: "name" },


        })
        // console.log(student);

        res.render('users/registered-courses', {
            script: '/public/javascripts/home.js',
            progress: '10',
            numlesson: '25',
            percent: +'10' / +'25' * 100,
            url: url,
            list: student.booked_courses,
        });
    },
    async removefromwishlist(req, res) {
        const id = req.params.id;
        const student = await Student.find({ "_id": req.session.user._id, "wish_courses.course_id": id });
        const len = student.length;
        
        // console.log("saaaaaaaaaaaaaaaa"+student);
        if (len > 0) {
            await Student.updateOne(
                { _id: req.session.user._id },
                { $pull: { wish_courses: { course_id: id } } },
                (err, data) => {
                    if (err) {

                        console.log(err);
                    }
                    else {

                        res.send("dddddddddd");
                    }
                });
        }
        else {
            await Student.updateOne(
                { _id: req.session.user._id },
                { $push: { wish_courses: { course_id: id } } },
                (err, data) => {
                    if (err) {
                        console.log(err);
                    }
                    else {
                        res.send("rrrrrrrrrr");
                    }
                });
        }
        console.log(len);


    }



};

