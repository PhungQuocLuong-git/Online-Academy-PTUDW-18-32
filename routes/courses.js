const express = require('express');
const router = express.Router();

const TeacherMiddleware = require('../app/middlewares/teacherMiddleware');

const courseController = require('../app/controller/CourseController');

router.get('/', courseController.list);
router.get('/list',courseController.list );
router.get('/search',courseController.search);
router.get('/create',TeacherMiddleware,courseController.create );
// router.get('/detail',courseController.detail);
router.post('/store',courseController.store);
router.post('/book/:id',courseController.book);

router.get('/:slug',courseController.detail);

module.exports = router;

