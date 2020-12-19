const express = require('express');
const router = express.Router();


const studentController = require('../app/controller/StudentController');

router.patch('/:id/swap', studentController.swap );
router.get('/create', studentController.create);
router.post('/store', studentController.store);
router.get('/login', studentController.login);
router.post('/check', studentController.check);
// router.post('/login', studentController.create);
router.get('/logout', studentController.logout);

module.exports = router;