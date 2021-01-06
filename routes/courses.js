const express = require('express');
const router = express.Router();

const TeacherMiddleware = require('../app/middlewares/teacher.mdw');

const courseController = require('../app/controller/CourseController');


router.get('/', courseController.courses);
router.get('/list', courseController.courses);
router.get('/search',courseController.search);
router.get('/create',TeacherMiddleware,courseController.create);
router.get('/wished',courseController.wished);
router.get('/fts',courseController.fts);
router.get('/list/:slug1/:slug2',courseController.listlevel2);
router.get('/list/:slug',courseController.listlevel1);

// router.get('/detail',courseController.detail);
router.post('/store',courseController.store);
router.post('/rate/:slug',courseController.storeRate);
// router.post('/fts',courseController.fts);
router.post('/book/:id',courseController.book);
router.post('/wish/:id',courseController.wish);
router.post('/add/:id',courseController.add);
router.patch('/delete',courseController.delete);
router.patch('/restore',courseController.restore);
router.delete('/destroy',courseController.destroy);

router.get('/:slug',courseController.detail);

module.exports = router;

