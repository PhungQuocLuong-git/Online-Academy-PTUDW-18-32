const express = require('express');
const router = express.Router();

const TeacherMiddleware = require('../app/middlewares/teacherMiddleware');

const courseController = require('../app/controller/CourseController');

router.get('/', courseController.list);
router.get('/list',courseController.list );
router.get('/search',courseController.search);
router.get('/detail',courseController.detail);
router.post('/store',courseController.store);

router.get('/create',TeacherMiddleware,courseController.create );

module.exports = router;

