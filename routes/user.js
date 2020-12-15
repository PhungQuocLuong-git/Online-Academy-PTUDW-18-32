const express = require('express');
const UserController = require('../app/controller/UserController');
const router = express.Router();



router.get('/edit-profile',UserController.checkactive, UserController.profile);
router.get('/edit-account',UserController.checkactive, UserController.account);
router.get('/watch-list',UserController.checkactive, UserController.watchlist);
router.get('/registered-courses',UserController.checkactive, UserController.registeredcourses);


module.exports = router;