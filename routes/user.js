const express = require('express');
const UserController = require('../app/controller/UserController');
const router = express.Router();



router.get('/edit-profile', UserController.profile);
router.get('/edit-account', UserController.account);
router.get('/watch-list', UserController.watchlist);
router.get('/registered-courses', UserController.registeredcourses);

router.post('/removefromwishlist/:id',UserController.removefromwishlist);


module.exports = router;