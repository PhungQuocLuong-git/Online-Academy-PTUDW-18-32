const siteRouter = require('./site');
const { mongooseToObject} = require('../util/mongoose');
//const createError = require('http-errors');
// const meRouter = require('./me');
// const accountRouter = require('./account');
const coursesRouter = require('./courses');
const userRouter = require('./user');
const studentRouter = require('./student');
const teacherRouter = require('./teacher');
// const studentRouter = require('./student');
// const AuthMiddleware = require('../app/middlewares/authMiddleware');
// const StudentMiddleware = require('../app/middlewares/studentMiddleware');
const TeacherMiddleware = require('../app/middlewares/teacher.mdw');



function route(app) {
    app.use(function (req, res, next) {
        if(typeof(req.session.role)==='undefined') {
            app.locals.role = 0 ;
        }
        else {
            app.locals.role = req.session.role;
            if(!req.app.locals.user)
                req.app.locals.user = req.session.user;
        }

    next();
      })  
    app.use('/courses',coursesRouter);
    // app.use('/me',TeacherMiddleware,meRouter);
    // app.use('/student',StudentMiddleware,studentRouter);
    // app.use('/account',accountRouter);
    app.use('/student',studentRouter);
    app.use('/teacher',teacherRouter);
    app.use('/user',userRouter);
    app.use('/', siteRouter);
    
    // catch 404 and forward to error handler
    app.use(function(req, res, next) {
        next(createError(404));
    });
    
    // error handler
    app.use(function(err, req, res, next) {
        // set locals, only providing error in development
        res.locals.message = err.message;
        res.locals.error = req.app.get('env') === 'development' ? err : {};
    
        // render the error page
        res.status(err.status || 500);
        res.render('error');
    });
}

module.exports = route;