const express = require('express');
const router = express.Router();

const isAdmin = require('../app/middlewares/adminMiddleware');
const isTeacher = require('../app/middlewares/teacher.mdw');

const teacherController = require('../app/controller/TeacherController');

router.get('/',isTeacher,teacherController.home);
router.get('/inprogress-courses',isTeacher,teacherController.inprogresscourses);
router.get('/complete-courses',isTeacher,teacherController.completecourses);
router.patch('/:id/swap', teacherController.swap );
router.get('/create', teacherController.create);
router.post('/store', teacherController.store);
router.get('/login', teacherController.login);
router.post('/check', teacherController.check);
router.patch('/change', teacherController.change);
router.patch('/censor',isAdmin, teacherController.censor);
router.patch('/block',isAdmin, teacherController.block);

// router.post('/login', teacherController.create);
router.get('/logout', teacherController.logout);
router.get('/courses',teacherController.uploadedCourses);

router.put('/:id', teacherController.update);

module.exports = router;