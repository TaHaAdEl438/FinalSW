const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const asyncHandler = require('express-async-handler');
const ApiError = require('../utils/apiError');
const User = require('../models/userModel');

//2- Generate token
const createToken = (payload) =>
  jwt.sign({ userId: payload }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_SECRET_TIME,
  });
// @desc  Signup
// @route GET / api/v1/auth/signup
// @access public
exports.signup = asyncHandler(async (req, res, next) => {
  //1- create user
  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
  });

  const token = createToken(user._id);
  res.status(201).json({ data: user, token });
});
// @desc  Login
// @route GET/api/v1/auth/login
// @access public
exports.login = asyncHandler(async (req, res, next) => {
  //1- check if email and  password in the body is correct(validation)
  //2- check if user exist and password is correct
  const user = await User.findOne({ email: req.body.email });

  if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
    return next(new ApiError('Incorrect email or password'));
  }
  //3-generate token
  const token = createToken(user._id);
  //4-send response to client side
  res.status(200).json({ data: user, token });
});
exports.protect = asyncHandler(async (req, res, next) => {
  //1) check if token exist , if exist get it
  console.log(req.headers);
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return next(
      new ApiError(
        'You are not login , Please login to get access to this route',
        401
      )
    );
  }
  //2) Verify token (no change happen ,expire token)
  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    console.log(decoded);
  //3) check if user exist
  //4) check if user change his password after token created
});
