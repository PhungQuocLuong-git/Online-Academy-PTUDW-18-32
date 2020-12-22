const express = require('express');
const router = express.Router();


const studentController = require('../app/controller/StudentController');

router.patch('/:id/swap', studentController.swap );
router.get('/create', studentController.create);
router.post('/store', studentController.store);
router.get('/login', studentController.login);
router.get('/cart/:id', studentController.cart);
router.post('/check', studentController.check);
// router.post('/login', studentController.create);
router.post('/logout', studentController.logout);
router.post('/handle-form-actions', studentController.handleFormActions);
router.delete('/delcart/:id', studentController.delcart);

module.exports = router;