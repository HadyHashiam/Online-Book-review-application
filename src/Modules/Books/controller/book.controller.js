const handlerFactory = require('../../handlersFactory.Controller');
const ApiError = require('../../../../utils/apiError');
const Book = require('../../../../models/Book.model');
const User = require('../../../../models/user.Model');
const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const slugify = require('slugify')


exports.createFilterObj = (req, res, next) => {
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

// @desc     Create One
// @route   POST /localhost:3000/books
exports.CreateOne = asyncHandler(async (req, res, next) => {
  try {
    // user Validators
    const userId = getUserIdFromToken(req);
    const currentuser = await User.findOne({ _id: userId });
    if (!currentuser) {
      return next(new ApiError('currentuser not found', 404));
    }
    createdby = currentuser._id;
    // catch data 
    const { ISBN, author, title, price, description, reviews } = req.body;
    let authorSlug = slugify(author)
    let titleSlug = slugify(title)
    const data = { ISBN, author, title, titleSlug, authorSlug, price, userId, description, reviews, createdby, timestamp: Date.now() };
    await handlerFactory.createOne(Book, data)(req, res, next);
    const newDoc = req.newDoc;
    res.status(201).json({ data: newDoc });
  } catch (error) {
    console.error(error);
    return next(new ApiError(error, 500));
  }

});


// @desc       Get list of Books
// @route   GET /localhost:3000/books
exports.GetALL = asyncHandler(async (req, res, next) => {
  try {
    console.log("req.query", req.query)
    await handlerFactory.getAll(Book)(req, res, next);
    paginationResult = req.paginationResult
    results = req.results
    documents = req.documents
    res.status(200).json({ results: documents.length, paginationResult, items: documents });
  } catch (error) {
    console.error(error);
    return next(new ApiError(error, 500));
  }
});


// @desc    Get specific Book by author
// @route   GET /localhost:3000/books/searchAuthor?author=1
exports.GetBookbyAuthor = asyncHandler(async (req, res, next) => {
  const { author } = req.query
  const books = await Book.find({ author: author })

  try {
    res.status(200).json({ results: books.length, data: books });
  } catch (error) {
    console.error(error);
    return next(new ApiError(error, 500));
  }
});




// @desc    Get specific Book by title
// @route   GET /localhost:3000/books/searchTitle?title=title
exports.GetBookbyTitle = asyncHandler(async (req, res, next) => {
  const { title } = req.query
  const books = await Book.find({ title: title })

  try {
    res.status(200).json({ results: books.length, data: books });
  } catch (error) {
    console.error(error);
    return next(new ApiError(error, 500));
  }
});


// @desc    Search book by ISBN
// @route   GET /localhost:3000/books/search?isbn=12345
exports.searchByISBN = (req, res, next) => {
  const { isbn } = req.query;

  if (!isbn) {
    return next(new ApiError('ISBN is required', 400));
  }

  Book.findOne({ ISBN: isbn })
    .then((book) => {
      if (!book) {
        return next(new ApiError('Book not found', 404));
      }
      res.status(200).json({ results: book.length, data: book });
    })
    .catch((error) => {
      console.error(error);
      next(new ApiError('Error fetching book', 500));
    });
};


// @desc    Get specific Book by id 
// @route   GET /localhost:3000/books/:id
exports.GetSingleOne = handlerFactory.getOne(Book);


// @desc    Update specific Book
// @route   PUT /api//Book/:id
exports.UpdateOne = handlerFactory.updateOne(Book);


// @desc    Delete specific Book
// @route   DELETE /localhost:3000/books/delete?id=id
exports.DeleteOne = asyncHandler(async (req, res, next) => {
  if (!req.query.id) {
    id = req.body.id
    console.log("req.body : ", req.body)
  } else {
    let { id } = req.query
    data = id
    console.log("req.query  : ", id)
  }
  try {
    await handlerFactory.deleteOne(Book, data)(req, res, next);
    const Doc = req.Doc;
    res.status(200).json({
      status: 'success',
      message: `Product by id: ${Doc} Deleted Successfully`,
      data: Doc
    });
  } catch (error) {
    console.error(error);
    return next(new ApiError(error, 500));
  }
});


exports.GetBookByAuthor = asyncHandler(async (req, res, next) => {
  try {
    const userId = getUserIdFromToken(req);
    const currentuser = await User.findOne({ _id: userId });
    if (!currentuser) {
      return next(new ApiError('currentuser not found', 404));
    }
    const { data } = req.query.author
    const book = await Book.find(
      { author: data },
    );

    if (!book) {
      return next(new ApiError('book not found', 404));
    }
    await handlerFactory.deleteOne(Book, data)(req, res, next);
    const Doc = req.Doc;
    res.status(200).json({
      status: 'success',
      message: `Product by id: ${Doc} Deleted Successfully`,
      data: Doc
    });
  } catch (error) {
    console.error(error);
    return next(new ApiError(error, 500));
  }
});
