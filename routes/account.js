const express = require('express');
const router = express.Router();


const accountController = require('../app/controller/AccountController');

router.get('/create', accountController.create);
router.post('/store', accountController.store);
router.get('/login', accountController.login);
router.post('/check', accountController.check);
router.post('/login', accountController.create);

module.exports = router;