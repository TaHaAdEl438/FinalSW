
const express = require('express');
const {
  signupValidator,
  loginValidator,
} = require('../utils/validator/authValidator');

const {
  signup,
  login,
} = require('../controller/authController');

const router = express.Router();

router.post('/signup', signupValidator, signup);
router.post('/login', loginValidator, login);

module.exports = router;
