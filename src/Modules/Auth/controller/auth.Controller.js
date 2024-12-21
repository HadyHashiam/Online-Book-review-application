const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const asyncHandler = require('express-async-handler');
const User = require('../../../../models/user.Model');
const ApiError = require('../../../../utils/apiError');
const createToken = require('../../../../utils/createToken');
const sendEmail = require('../../../../utils/sendEmail');


// @desc    post Signup
// @route   post /api/auth/signup
// @access  Public
exports.postSignup = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;

  console.log("Received Data:", { name, email, password });
  try {
    const user = await User.create({
      name,
      email,
      password,
    });
    const token = createToken(user._id);
    console.log("sign up successfuly");
    res.status(201).json({ data: user, token });
  } catch (err) {
    console.log(err);
    res.status(400).json({ error: err.message });
  }
});


// @desc    postLogin
// @route   post /auth/login
exports.postlogin = asyncHandler(async (req, res, next) => {
  // 1) Validate email and password
  const user = await User.findOne({ email: req.body.email });
  if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
    return next(new ApiError('Incorrect email or password', 401));
  }
  console.log("user", user)
  // 2) Generate token
  const token = createToken(user._id);
  // 3) Set cookie
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', 
    maxAge: 24 * 60 * 60 * 1000, 
    sameSite: 'None' 
  });
  req.session.user = user; 
  console.log("done fun on");
  res.status(200).json({ data: user, token });
  console.log("The user token from login is: " + token);
});



// @desc   make sure the user is logged in
exports.protect = asyncHandler(async (req, res, next) => {
  // 1) Check if token exists
  let token;
  // Check for token in headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  // Check for token in cookies if not found in headers
  if (!token && req.cookies.token) {
    token = req.cookies.token;
  }
  // Check if user is logged in with Google and generate
  if (req.session && req.session.passport && req.session.passport.user) {
    req.user = req.session.passport.user;
    return next();
  }
  if (!token) {
    return next(
      new ApiError(
        'You are not logged in. Please log in to get access to this route.',
        401
      )
    );
  }

  // 2) Verify token
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
  } catch (err) {
    return next(
      new ApiError(
        'Invalid token. Please log in again.',
        401
      )
    );
  }

  // 3) Check if user exists
  const currentUser = await User.findById(decoded.userId);
  if (!currentUser) {
    return next(
      new ApiError(
        'The user that belongs to this token does no longer exist.',
        401
      )
    );
  }

  // 4) Check if user changed password after token was issued
  if (currentUser.passwordChangedAt) {
    const passChangedTimestamp = parseInt(
      currentUser.passwordChangedAt.getTime() / 1000,
      10
    );
    if (passChangedTimestamp > decoded.iat) {
      return next(
        new ApiError(
          'User recently changed their password. Please log in again.',
          401
        )
      );
    }
  }

  req.user = currentUser;
  next();
});



// @desc    Authorization (User Permissions)
["admin"]
exports.allowedTo = (...roles) =>
  asyncHandler(async (req, res, next) => {
    // 1) access roles
    // 2) access registered user (req.user.role)
    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError('You are not allowed to access this route', 403)
      );
    }
    next();
  });




// @desc    Forgot password
// @route   POST /auth/forgotPassword
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  // 1) Get user by email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(
      new ApiError(`There is no user with that email ${req.body.email}`, 404)
    );
  }
  // 2) If user exist, Generate hash reset random 6 digits and save it in db
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedResetCode = crypto
    .createHash('sha256')
    .update(resetCode)
    .digest('hex');

  // Save hashed password reset code into db
  user.passwordResetCode = hashedResetCode;
  // Add expiration time for password reset code (10 min)
  user.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  user.passwordResetVerified = false;
  await user.save();
  // 3) Send the reset code via email
  const message = `Hi ${user.name},\n We received a request to reset the password Account. \n ${resetCode} \n Enter this code to complete the reset. \n Thanks for helping us keep your account secure.`;
  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset code (valid for 10 min)',
      message,
    });
  } catch (err) {
    user.passwordResetCode = undefined;
    user.passwordResetExpires = undefined;
    user.passwordResetVerified = undefined;

    await user.save();
    return next(new ApiError('There is an error in sending email', 500));
  }
  res
    .status(200)
    .json({ status: 'Success', message: 'Reset code sent to email' });
});


// @desc    Verify password reset code
// @route   POST /auth/verifyResetCode
exports.verifyPassResetCode = asyncHandler(async (req, res, next) => {
  // 1) Get user based on reset code
  const hashedResetCode = crypto
    .createHash('sha256')
    .update(req.body.resetCode)
    .digest('hex');

  const user = await User.findOne({
    passwordResetCode: hashedResetCode,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) {
    return next(new ApiError('Reset code invalid or expired'));
  }
  // 2) Reset code valid
  user.passwordResetVerified = true;
  await user.save();

  res.status(200).json({
    status: 'Success',
  });
});




// @desc    Reset password
// @route   POST /auth/resetPassword
exports.resetPassword = asyncHandler(async (req, res, next) => {
  // 1) Get user based on email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(
      new ApiError(`There is no user with email ${req.body.email}`, 404)
    );
  }

  if (!user.passwordResetVerified) {
    return next(new ApiError('Reset code not verified', 400));
  }

  user.password = req.body.newPassword;
  user.passwordResetCode = undefined;
  user.passwordResetExpires = undefined;
  user.passwordResetVerified = undefined;
  await user.save();

  const token = createToken(user._id);
  res.status(200).json({ token });
});



exports.cookieJwtAuth = async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return next(new ApiError('You are not logged in', 401));
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const currentUser = await User.findById(decoded.userId);
    if (!currentUser) {
      return next(new ApiError('The user belonging to this token does no longer exist', 401));
    }
    req.user = currentUser;
    next();
  } catch (err) {
    return next(new ApiError('Invalid token, please log in again', 401));
  }
};




