const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const asyncHandler = require("express-async-handler");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const sendEmail = require("../utils/sendEmail");
const ApiError = require("../utils/apiError");
const User = require("../models/userModel");

// Generate token
const createToken = (payload) =>
  jwt.sign({ userId: payload }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_SECRET_TIME,
  });

// @desc  Signup
// @route POST /api/v1/auth/signup
// @access public
exports.signup = asyncHandler(async (req, res, next) => {
  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: await bcrypt.hash(req.body.password, 10),
  });

  const token = createToken(user._id);
  res.status(201).json({ data: user, token });
});

// @desc  Login
// @route POST /api/v1/auth/login
// @access public
exports.login = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
    return next(new ApiError("Incorrect email or password", 401));
  }

  const token = createToken(user._id);
  res.status(200).json({ data: user, token });
});

// @desc  Forget Password
// @route POST /api/v1/auth/forgot-password
// @access public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return next(new ApiError("المستخدم غير موجود", 404));
  }

  // إنشاء رمز إعادة تعيين كلمة المرور
  const resetToken = crypto.randomBytes(32).toString("hex");
  user.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  user.resetPasswordExpires = Date.now() + 3600000; // صلاحية التوكين ساعة واحدة
  await user.save();

  // إرسال البريد الإلكتروني
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    to: user.email,
    from: process.env.EMAIL_USER,
    subject: "إعادة تعيين كلمة المرور",
    text: `اضغط على الرابط التالي لإعادة تعيين كلمة المرور: 
    ${process.env.FRONTEND_URL}/reset-password/${resetToken}`,
  };

  await transporter.sendMail(mailOptions);
  res.json({ message: "تم إرسال رابط إعادة التعيين إلى الإيميل" });
});

// @desc  Reset Password
// @route POST /api/v1/auth/reset-password/:token
// @access public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  // تشفير التوكين المرسل من المستخدم
  const hashedToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  // البحث عن المستخدم باستخدام التوكين المشفر
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ApiError("التوكين غير صالح أو منتهي الصلاحية", 400));
  }

  // تحديث كلمة المرور
  user.password = await bcrypt.hash(newPassword, 10);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  res.json({ message: "تم إعادة تعيين كلمة المرور بنجاح" });
});

// @desc Protect routes (Middleware)
// @route Any protected route
// @access private
exports.protect = asyncHandler(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    return next(
      new ApiError(
        "You are not logged in, Please login to get access to this route",
        401
      )
    );
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
  console.log(decoded);
  next();
});