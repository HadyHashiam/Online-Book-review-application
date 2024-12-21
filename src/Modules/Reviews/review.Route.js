const router = require("express").Router({ mergeParams: true });
const bodyParser = require("body-parser");
const {
  GetAllReviews,
  AddReview,
  deleteReview,
  ModifyReview,
} = require('../Reviews/controller/review.controller');

const authService = require("../Auth/controller/auth.Controller")
router.use(authService.protect); // Protect all routes


router.post("/:id/review", AddReview);
router.get("/:id/review", GetAllReviews);
router.delete("/:id/review/:reviewId", deleteReview);
router.put("/:id/review/:reviewId", ModifyReview);



module.exports = router;
