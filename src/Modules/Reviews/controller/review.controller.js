const ApiError = require('../../../../utils/apiError');
const Book = require('../../../../models/Book.model');
const User = require('../../../../models/user.Model');
const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');


exports.createFilterObj = (req, res, next) => {
  // console.log(req.params)
  // console.log("done")
  let filterObject = {};
  if (req.params.userId) filterObject = { userId: req.params.userId };
  req.filterObj = filterObject;
  next();
};

// Function to get userId from token
const getUserIdFromToken = (req) => {

  const token = req.cookies.token;
  if (!token) throw new ApiError('No token provided', 401);
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    return decoded.userId;
  } catch (err) {
    throw new ApiError('Invalid token', 401);
  }
};


// @route   POST /localhost:3000/books/:id/review
exports.GetAllReviews = asyncHandler(async (req, res, next) => {
  try {
    const userId = getUserIdFromToken(req);
    const currentuser = await User.findOne({ _id: userId });
    if (!currentuser) {
      return next(new ApiError('currentuser not found', 404));
    }
    // find book 
    const book = await Book.findById(req.params.id);
    if (!book) {
      return next(new ApiError('book not found', 404));
    }
    // find reviews array
    const reviews = book.reviews
    res.status(201).json({ data: reviews });
  } catch (error) {
    console.error(error);
    return next(new ApiError(error, 500));
  }

});


// @desc     Create review
// @route   POST /localhost:3000/books/:id/review
exports.AddReview = asyncHandler(async (req, res, next) => {

  try {
    const userId = getUserIdFromToken(req);
    const currentuser = await User.findOne({ _id: userId });
    if (!currentuser) {
      return next(new ApiError('currentuser not found', 404));
    }
    // find book 
    const book = await Book.findById(req.params.id);
    if (!book) {
      return next(new ApiError('book not found', 404));
    }
    const { review, by } = req.body;
    // add review 
    const reviewObj = { review, by };
    book.reviews.push(reviewObj);
    await book.save();
    res.status(201).json({ data: book });
  } catch (error) {
    console.error(error);
    return next(new ApiError(error, 500));
  }
});


// @desc     delete  review
// @route   Delete /localhost:3000/books/:id/review/:reviewId
exports.deleteReview = asyncHandler(async (req, res, next) => {
  try {
    const userId = getUserIdFromToken(req);
    const currentuser = await User.findOne({ _id: userId });
    if (!currentuser) {
      return next(new ApiError('currentuser not found', 404));
    }
    const book = await Book.findById(req.params.id);
    if (!book) {
      return next(new ApiError('book not found', 404));
    }
    // find review index
    const reviewId = req.params.reviewId;
    const reviewIndex = book.reviews.findIndex(review => review._id.toString() === reviewId);
    console.log("reviewIndex :", reviewIndex);
    if (!reviewIndex) {
      return next(new ApiError(" not found ", 404));
    }
    else {
      if (reviewIndex !== -1) { }
      book.reviews.splice(reviewIndex, 1);
      await book.save();
    }
    res.status(200).json({ data: book, message: 'review deleted successfully' });
  } catch (error) {
    console.error(error);
    return next(new ApiError(error, 500));
  }
});


// @desc     Modify review
// @route   PUT /localhost:3000/books/:id/review/:reviewId
exports.ModifyReview = asyncHandler(async (req, res, next) => {
  try {
    const userId = getUserIdFromToken(req);
    const currentuser = await User.findOne({ _id: userId });
    if (!currentuser) {
      return next(new ApiError('currentuser not found', 404));
    }
    const book = await Book.findById(req.params.id);
    if (!book) {
      return next(new ApiError('book not found', 404));
    }
    const reviews = book.reviews
    const review = reviews.find((review) => review._id.toString() === req.params.reviewId);
    const data = req.body.review
    // review.review = data
    const reviewId = req.params.reviewId;
    const reviewIndex = book.reviews.findIndex(review => review._id.toString() === reviewId);
    console.log("reviewIndex :", reviewIndex);
    await book.save();
    res.status(200).json({ data: book, message: 'review updated successfully' });
  } catch (error) {
    console.error(error);
    return next(new ApiError(error, 500));
  }
});




