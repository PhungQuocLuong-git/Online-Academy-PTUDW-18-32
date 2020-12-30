const express = require('express');
const router = express.Router();

const TeacherMiddleware = require('../app/middlewares/teacher.mdw');

const courseController = require('../app/controller/CourseController');


router.get('/', courseController.list);
router.get('/list',courseController.list);
router.get('/search',courseController.search);
router.get('/create',TeacherMiddleware,courseController.create);
router.get('/wished',courseController.wished);

// router.get('/detail',courseController.detail);
router.post('/store',courseController.store);
router.post('/fts',courseController.fts);
router.post('/book/:id',courseController.book);
router.post('/wish/:id',courseController.wish);
router.post('/add/:id',courseController.add);

router.get('/:slug',courseController.detail);

module.exports = router;

