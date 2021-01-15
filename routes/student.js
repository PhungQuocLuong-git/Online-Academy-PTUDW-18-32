const express = require('express');
const router = express.Router();

const isStudent = require('../app/middlewares/studentMiddleware')


const studentController = require('../app/controller/StudentController');

router.get('/create', studentController.create);
router.post('/store', studentController.store);
router.get('/login', studentController.login);
router.post('/check-otp', studentController.checkOtp);
router.get('/cart/:id',isStudent, studentController.cart);
router.patch('/change', studentController.change);
router.post('/check', studentController.check);
router.post('/updateprocess/:courseid/:lectureid', studentController.updateprocess);
router.post('/check/detail', studentController.checkDetail);
router.post('/logout', studentController.logout);
router.post('/handle-form-actions', studentController.handleFormActions);
router.put('/:id', studentController.update);
router.delete('/delcart/:id', studentController.delcart);
router.patch('/block', studentController.block);


module.exports = router;