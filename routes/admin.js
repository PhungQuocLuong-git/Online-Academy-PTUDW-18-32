const express = require('express');
const router = express.Router();


const adminController = require('../app/controller/AdminController');

router.post('/categories/del', adminController.del);
router.post('/categories/patch', adminController.patch);
router.post('/subcategories/del', adminController.subdel);
router.post('/subcategories/patch', adminController.subpatch);
router.post('/check', adminController.check);
router.get('/login', adminController.login);
router.get('/logout', adminController.logout);
router.get('/', adminController.home);
router.get('/teacher-queue', adminController.teacherQueue);
router.get('/categories/add', adminController.addcategory);
router.get('/categories/:id', adminController.editcategory);
router.get('/subcategories/:id', adminController.editsubcategory);
router.get('/categories/addsub/:id', adminController.addsubcategory);
router.post('/categories/addsub/:id', adminController.addsubPost);
router.get('/categories', adminController.categories);
router.post('/categories/add', adminController.addcatPost);




module.exports = router;