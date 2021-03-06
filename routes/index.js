const siteRouter = require('./site');
// const { mongooseToObject } = require('../util/mongoose');
//const createError = require('http-errors');
// const meRouter = require('./me');
// const accountRouter = require('./account');
const coursesRouter = require('./courses');
const userRouter = require('./user');
const studentRouter = require('./student');
const teacherRouter = require('./teacher');
const admin = require('./admin');
// const studentRouter = require('./student');
// const AuthMiddleware = require('../app/middlewares/authMiddleware');
// const StudentMiddleware = require('../app/middlewares/studentMiddleware');
// const TeacherMiddleware = require('../app/middlewares/teacher.mdw');
// const adminMiddleware = require('../app/middlewares/adminMiddleware');
// const { request } = require('../app');
const loadCategories =require('../app/middlewares/categories.mdw');




function route(app) {
    app.use(function (req, res, next) {
        if (typeof (req.session.role) === 'undefined') {
            
            app.locals.role = 0;
            app.locals.idUser = 0;
            app.locals.nameUser = 'User';
            app.locals.user = {};
        }
        else {
            app.locals.role = req.session.role;
            if (!req.app.locals.user)
                req.app.locals.user = req.session.user;
        }

        next();
    })
    app.use(loadCategories.loadCategories);

    app.use('/courses', coursesRouter);
    // app.use('/me',TeacherMiddleware,meRouter);
    // app.use('/student',StudentMiddleware,studentRouter);
    // app.use('/account',accountRouter);
    app.use('/student', studentRouter);
    app.use('/teacher', teacherRouter);
    app.use('/user', userRouter);
    app.use('/', siteRouter);
    app.use('/admin', admin);


    // catch 404 and forward to error handler
    app.use(function (req, res, next) {
        res.render('404',{layout:false})
        // next(createError(404));
        //next();
    });

    // error handler
    app.use(function (err, req, res, next) {
        //set locals, only providing error in development
        res.locals.message = err.message;
        res.locals.error = req.app.get('env') === 'development' ? err : {};
        console.log(err);

        // render the error page
        res.status(err.status || 500);
        res.render('error', {
                layout: false
        });
    });
}

module.exports = route;