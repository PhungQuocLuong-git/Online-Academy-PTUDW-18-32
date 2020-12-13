const express = require('express');
const UserController = require('../app/controller/UserController');
const router = express.Router();



router.get('/edit-profile', UserController.profile);
router.get('/edit-account', UserController.account);


module.exports = router;