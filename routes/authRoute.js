const express = require("express");
const {
  signupValidator,
  loginValidator,
} = require("../utils/validator/authValidator");

const {
  signup,
  login,
  forgotPassword,
  resetPassword,
} = require("../controller/authController");

const router = express.Router();

// Routes
router.post("/signup", signupValidator, signup);
router.post("/login", loginValidator, login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

module.exports = router;