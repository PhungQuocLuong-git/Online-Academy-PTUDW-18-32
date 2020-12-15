const express = require('express');
const router = express.Router();


const courseController = require('../app/controller/CourseController');

// router.get('/', courseController.list);
router.get('/',courseController.list );
router.get('/create',courseController.create );

module.exports = router;

