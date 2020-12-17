const siteRouter = require('./site');
// const meRouter = require('./me');
const accountRouter = require('./account');
const coursesRouter = require('./courses');
const userRouter = require('./user');
// const studentRouter = require('./student');
// const AuthMiddleware = require('../app/middlewares/authMiddleware');
// const StudentMiddleware = require('../app/middlewares/studentMiddleware');
const TeacherMiddleware = require('../app/middlewares/teacherMiddleware');


function route(app) {
    app.locals.role = 0 ;
    app.locals.idUser = 0 ;
    app.locals.nameUser = 'User' ;
    app.locals.user = {};
    app.use('/courses',coursesRouter);
    // app.use('/me',TeacherMiddleware,meRouter);
    // app.use('/student',StudentMiddleware,studentRouter);
    app.use('/account',accountRouter);
    app.use('/user',userRouter);
    app.use('/', siteRouter);
    
    // // catch 404 and forward to error handler
    // app.use(function(req, res, next) {
    //     next(createError(404));
    // });
    
    // // error handler
    // app.use(function(err, req, res, next) {
    //     // set locals, only providing error in development
    //     res.locals.message = err.message;
    //     res.locals.error = req.app.get('env') === 'development' ? err : {};
    
    //     // render the error page
    //     res.status(err.status || 500);
    //     res.render('error');
    // });
}

module.exports = route;