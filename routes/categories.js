const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/protect");
const {
  getCategories,
  getCategory,
  deleteCategory,
  updateCategory,
  createCategory,
} = require("../controller/categories");

const { getCategoryBooks } = require("../controller/books");
// /api/v1/:id/books ийм api гээр дуудагдвал
router.route("/:categoryId/books").get(getCategoryBooks);
// route

// const booksRouter = require("./books");
// router.use("/:categoryId/books", booksRouter);

router
  .route("/")
  .get(getCategories)
  .post(protect, authorize("admin"), createCategory);

router
  .route("/:id")
  .get(getCategory)
  .put(protect, authorize("admin"), updateCategory)
  .delete(protect, authorize("admin"), deleteCategory);

module.exports = router;
