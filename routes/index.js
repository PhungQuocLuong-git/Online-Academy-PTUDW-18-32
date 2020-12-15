const siteRouter = require('./site');
// const meRouter = require('./me');
const accountRouter = require('./account');
const coursesRouter = require('./course');
// const studentRouter = require('./student');
// const AuthMiddleware = require('../app/middlewares/authMiddleware');
// const StudentMiddleware = require('../app/middlewares/studentMiddleware');
// const TeacherMiddleware = require('../app/middlewares/teacherMiddleware');


function route(app) {
    app.locals.isTeacher = false ;
    app.locals.isAdmin = false ;
    app.locals.loged = false ;
    app.locals.user = {};
    app.use('/courses',coursesRouter);
    // app.use('/me',TeacherMiddleware,meRouter);
    // app.use('/student',StudentMiddleware,studentRouter);
    app.use('/account',accountRouter);
    app.use('/', siteRouter);

}

module.exports = route;