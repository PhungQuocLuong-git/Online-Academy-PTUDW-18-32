var express = require('express');
var router = express.Router();
var SiteCotroller = require('../app/controller/SiteCotroller');

/* GET home page. */
router.get('/', SiteCotroller.home);

module.exports = router;