const router = require("express").Router({ mergeParams: true });
const bodyParser = require("body-parser");
const {
  GetALL,
  GetSingleOne,
  CreateOne,
  UpdateOne,
  DeleteOne,
  GetBookbyAuthor,
  GetBookbyTitle,
  searchByISBN,
  createFilterObj
} = require('./controller/book.controller');

const authService = require("../Auth/controller/auth.Controller")
router.use(authService.protect); // Protect all routes

router.post("/",
  bodyParser.urlencoded({ extended: true }),
  CreateOne
);
router.get("/", createFilterObj, GetALL);
router.get("/searchAuthor", createFilterObj, GetBookbyAuthor);
router.get("/searchTitle", createFilterObj, GetBookbyTitle);
router.get("/searchIsbn", createFilterObj, searchByISBN);
router.get("/:id", createFilterObj, GetSingleOne);
router.put("/:id", UpdateOne)
router.delete("/delete/", DeleteOne)



module.exports = router;
