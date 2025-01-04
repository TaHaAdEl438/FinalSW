const express = require('express');

const {
  getCategories,
  createCategory,
} = require('../controller/categoryController');

const authController = require('../controller/authController');

const router = express.Router();

router.route('/').get(getCategories).post(authController.protect,createCategory);

module.exports = router;
