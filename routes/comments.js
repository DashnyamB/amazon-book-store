const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/protect");
const {
  createComment,
  updateComment,
  deleteComment,
  getComment,
  getComments,
} = require("../controller/comments");

router
  .route("/")
  .post(protect, authorize("admin", "operator", "user"), createComment)
  .get(getComments);
router
  .route("/:id")
  .get(getComment)
  .put(protect, authorize("admin", "operator", "user"), updateComment)
  .delete(protect, authorize("admin", "operator", "user"), deleteComment);

module.exports = router;
