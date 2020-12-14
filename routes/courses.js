const express = require('express');
const router = express.Router();


const courseController = require('../app/controller/CourseController');

router.get('/', courseController.list);
router.get('/list',courseController.list );
router.get('/search',courseController.search);
router.get('/detail',courseController.detail);


module.exports = router;

