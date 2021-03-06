const express = require('express');
const router = express.Router();

const TeacherMiddleware = require('../app/middlewares/teacher.mdw');

const courseController = require('../app/controller/CourseController');


router.get('/', courseController.courses);
router.get('/edit/:slug', courseController.isown, courseController.edit);
router.post('/complete/:slug', courseController.isown, courseController.complete);
router.post('/edit/addchapter/:slug', courseController.isown, courseController.addchapter);
router.post('/edit/general/:slug', courseController.isown, courseController.general);
router.post('/edit/changeimg/:slug', courseController.isown, courseController.changeimg);
router.post('/edit/addletter/:slug/:idchapter', courseController.isown, courseController.addletter);
router.post('/edit/renamechap/:slug/:idchapter', courseController.isown, courseController.renamechap);
router.post('/edit/delelechap/:slug/:idcourse/:idchapter', courseController.isown, courseController.deletechap);
router.get('/list', courseController.courses);
router.get('/search',courseController.search);
router.get('/create',TeacherMiddleware,courseController.create);
router.get('/wished',courseController.wished);
router.get('/fts',courseController.fts);
router.get('/getSubByCatId',courseController.getSubByCatId);
router.get('/get/courses',courseController.getPopById);

// router.get('/detail',courseController.detail);
router.post('/store', courseController.store);
router.post('/rate/:slug', courseController.storeRate);
// router.post('/fts',courseController.fts);
router.post('/book/:id', courseController.book);
router.post('/wish/:id', courseController.wish);
router.post('/add/:id', courseController.add);
router.patch('/delete', courseController.delete);
router.patch('/restore', courseController.restore);
router.delete('/destroy', courseController.destroy);

router.get('/:slug', courseController.detail);

module.exports = router;

