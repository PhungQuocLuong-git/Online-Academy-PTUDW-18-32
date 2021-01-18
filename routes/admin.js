const express = require('express');
const router = express.Router();

const isAdmin = require('../app/middlewares/adminMiddleware');

const adminController = require('../app/controller/AdminController');

router.post('/check', adminController.check);
router.get('/login', adminController.login);
router.get('/logout', adminController.logout);
router.get('/',isAdmin, adminController.home);
router.get('/teacher-queue',isAdmin, adminController.teacherQueue);
router.get('/teachers',isAdmin, adminController.teachers);
router.get('/categories',isAdmin, adminController.categories);
router.get('/courses',isAdmin, adminController.courses);
router.get('/trash',isAdmin, adminController.trash);
router.get('/categories/add',isAdmin, adminController.addcategory);
router.get('/categories/:id',isAdmin, adminController.editcategory);
router.get('/subcategories/:id',isAdmin, adminController.editsubcategory);
router.get('/categories/addsub/:id',isAdmin, adminController.addsubcategory);
router.post('/categories/addsub', adminController.addsubPost);
router.delete('/categories/del', adminController.del);
router.patch('/categories/patch', adminController.patch);
router.delete('/subcategories/del', adminController.subdel);
router.patch('/subcategories/patch', adminController.subpatch);
router.post('/categories/add', adminController.addcatPost);




module.exports = router;