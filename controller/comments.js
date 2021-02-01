const MyError = require("../utils/myError");
const asyncHandler = require("../middleware/asyncHandler");
const paginate = require("../utils/pagenate-sequelize");

exports.createComment = asyncHandler(async (req, res, next) => {
  console.log("Data : ", req.body);
  const comment = await req.db.comments.create(req.body);

  res.status(200).json({
    success: true,
    comment,
  });
});
// /api/v2/:id
exports.updateComment = asyncHandler(async (req, res, next) => {
  let comment = await req.db.comments.findByPk(req.params.id);

  if (!comment) {
    throw new MyError(req.params.id + " ийм ID тай сэтгэгдэл олдсонгүй", 400);
  }

  comment = await comment.update(req.body);

  res.status(200).json({
    success: true,
    comment,
  });
});

exports.deleteComment = asyncHandler(async (req, res, next) => {
  let comment = await req.db.comments.findByPk(req.params.id);

  if (!comment) {
    throw new MyError(req.params.id + " ийм ID тай сэтгэгдэл олдсонгүй", 400);
  }

  comment = await comment.destroy();

  res.status(200).json({
    success: true,
    comment,
  });
});

exports.getComment = asyncHandler(async (req, res, next) => {
  let comment = await req.db.comments.findByPk(req.params.id);

  if (!comment) {
    throw new MyError(req.params.id + " ийм ID тай сэтгэгдэл олдсонгүй", 400);
  }

  const user = await comment.getUser();

  res.status(200).json({
    success: true,
    comment,
    user,
    book: await comment.getBook(),
  });
});

exports.getComments = asyncHandler(async (req, res, next) => {
  let select = req.query.select;
  let sort = req.query.sort;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 4;
  ["select", "sort", "page", "limit"].forEach((el) => delete req.query[el]);
  // pagination
  const pagination = await paginate(req.db.comments, page, limit);

  let query = { offset: pagination.start - 1, limit };
  if (sort) {
    query.order = sort
      .split(" ")
      .map((el) => [
        el.charAt(0) === "-" ? el.substring(1) : el,
        el.charAt(0) === "-" ? "DESC" : "ASC",
      ]);
  }
  if (select) {
    query.attributes = select.split(" ");
  }

  console.log(req.query);

  if (req.query) {
    query.where = req.query;
  }

  const comments = await req.db.comments.findAll(query);
  res.status(200).json({
    success: true,
    data: comments,
    pagination,
  });
});

// Lazy loading
exports.getUserComments = asyncHandler(async (req, res, next) => {
  let user = await req.db.user.findByPk(req.params.id);

  if (!user) {
    throw new MyError(req.params.id + " ийм ID тай хэрэглэгч олдсонгүй", 400);
  }

  const comments = await user.getComments();

  res.status(200).json({
    success: true,
    user,
    comments,
  });
});

// Eager loading
exports.getBookComments = asyncHandler(async (req, res, next) => {
  let book = await req.db.book.findByPk(req.params.id, {
    include: req.db.comments,
  });

  if (!book) {
    throw new MyError(req.params.id + " ийм ID тай book олдсонгүй", 400);
  }

  res.status(200).json({
    success: true,
    book,
  });
});
