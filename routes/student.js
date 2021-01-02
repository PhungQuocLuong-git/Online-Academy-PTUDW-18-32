const express = require('express');
const router = express.Router();

const isStudent = require('../app/middlewares/studentMiddleware')


const studentController = require('../app/controller/StudentController');

router.get('/create', studentController.create);
router.post('/store', studentController.store);
router.get('/login', studentController.login);
router.post('/check-otp', studentController.checkOtp);
router.get('/cart/:id',isStudent, studentController.cart);
router.post('/change', studentController.change);
router.post('/check', studentController.check);
router.post('/logout', studentController.logout);
router.post('/handle-form-actions', studentController.handleFormActions);
router.put('/:id', studentController.update);
router.delete('/delcart/:id', studentController.delcart);

module.exports = router;