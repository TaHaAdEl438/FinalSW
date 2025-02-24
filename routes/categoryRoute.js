const express = require("express");
const {
  getCategories,
  createCategory,
} = require("../controller/categoryController");

const { protect } = require("../controller/authController");

const router = express.Router();

// تأكد أن `protect` ليست undefined
router.route("/").get(getCategories).post(protect, createCategory);

module.exports = router;