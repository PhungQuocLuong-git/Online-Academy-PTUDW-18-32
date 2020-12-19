const express = require('express');
const router = express.Router();


const teacherController = require('../app/controller/TeacherController');

router.patch('/:id/swap', teacherController.swap );
router.get('/create', teacherController.create);
router.post('/store', teacherController.store);
router.get('/login', teacherController.login);
router.post('/check', teacherController.check);
// router.post('/login', teacherController.create);
router.get('/logout', teacherController.logout);

module.exports = router;