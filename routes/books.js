const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/protect");
const {
  getBooks,
  getBook,
  createBook,
  deleteBook,
  updateBook,
  uploadBookPhoto,
} = require("../controller/books");

const { getBookComments } = require("../controller/comments");
// route

router
  .route("/")
  .get(getBooks)
  .post(protect, authorize("admin", "operator"), createBook);
router
  .route("/:id")
  .get(getBook)
  .delete(protect, authorize("admin"), deleteBook)
  .put(protect, authorize("admin", "operator", "user"), updateBook);
router
  .route("/:id/photo")
  .put(protect, authorize("admin", "operator", "user"), uploadBookPhoto);

router.route("/:id/comments").get(getBookComments);
module.exports = router;
