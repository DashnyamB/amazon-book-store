const express = require("express");
const router = express.Router();
const {
  register,
  login,
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  forgotPassword,
  resetPassword,
  logout,
} = require("../controller/users");

const { protect, authorize } = require("../middleware/protect");

const { getUserBooks } = require("../controller/books");
const { getUserComments } = require("../controller/comments");
// route
router.route("/login").post(login);
router.route("/logout").get(logout);
router.route("/register").post(register);
router.route("/forgot-password").post(forgotPassword);
router.route("/reset-password").post(resetPassword);
router.route("/:id/comments").get(getUserComments);
// хэрвээ үүнээс доош route-үүд тухайн middleware-ыг ашиглах бол ингэж бичиж болно.
router.use(protect);

router
  .route("/")
  .get(authorize("admin"), getUsers)
  .post(authorize("admin"), createUser);
router
  .route("/:id")
  .get(authorize("admin"), getUser)
  .delete(authorize("admin"), deleteUser)
  .put(authorize("admin"), updateUser);
router
  .route("/:id/books")
  .get(authorize("admin", "operator", "user"), getUserBooks);

module.exports = router;
