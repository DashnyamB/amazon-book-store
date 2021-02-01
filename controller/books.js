const path = require("path");
const Book = require("../models/book");
const MyError = require("../utils/myError");
const asyncHandler = require("../middleware/asyncHandler");
const Category = require("../models/category");
const paginate = require("../utils/paginate");

//  api/v1/books ||
exports.getBooks = asyncHandler(async (req, res, next) => {
  const select = req.query.select;
  const sort = req.query.sort;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;

  ["select", "sort", "page", "limit"].forEach((el) => delete req.query[el]);
  // pagination
  const pagination = await paginate(Book, page, limit);

  const books = await Book.find(req.query, select)
    .populate({
      path: "category",
      select: "name averagePrice",
    })
    .sort(sort)
    .skip(pagination.start - 1)
    .limit(limit);

  res.status(200).json({
    count: books.length,
    success: true,
    data: books,
    pagination,
  });
});
// /api/v1/users/:userId/books
exports.getUserBooks = asyncHandler(async (req, res, next) => {
  const select = req.query.select;
  const sort = req.query.sort;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;

  ["select", "sort", "page", "limit"].forEach((el) => delete req.query[el]);
  // pagination
  const pagination = await paginate(Book, page, limit);

  req.query.createdUser = req.userId;

  const books = await Book.find(req.query, select)
    .populate({
      path: "category",
      select: "name averagePrice",
    })
    .sort(sort)
    .skip(pagination.start - 1)
    .limit(limit);

  res.status(200).json({
    count: books.length,
    success: true,
    data: books,
    pagination,
  });
});
// api/v1/categories/:catId/books
exports.getCategoryBooks = asyncHandler(async (req, res, next) => {
  const select = req.query.select;
  const sort = req.query.sort;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;

  ["select", "sort", "page", "limit"].forEach((el) => delete req.query[el]);
  // pagination
  const pagination = await paginate(Book, page, limit);

  // req.query, select
  const books = await Book.find({
    ...req.query,
    category: req.params.categoryId,
  })
    .select(select)
    .sort(sort)
    .skip(pagination.start - 1)
    .limit(limit);

  res.status(200).json({
    count: books.length,
    success: true,
    data: books,
    pagination,
  });
});

exports.getBook = asyncHandler(async (req, res, next) => {
  const book = await Book.findById(req.params.id);
  if (!book) {
    throw new MyError(req.params.id + " ID тэй ном алга", 404);
  }
  res.status(200).json({
    success: true,
    data: book,
  });
});

exports.createBook = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.body.category);

  if (!category) {
    throw new MyError(`${req.params.id} - ID - тай категори байхгүй`, 400);
  }
  req.body.createdUser = req.userId;

  const book = await Book.create(req.body);

  res.status(200).json({
    success: true,
    data: book,
  });
});

exports.deleteBook = asyncHandler(async (req, res, next) => {
  const book = await Book.findById(req.params.id);

  if (!book) {
    throw new MyError(req.params.id + " ID тэй ном алга", 404);
  }
  if (book.createdUser.toString() !== req.userId && req.userRole !== "admin") {
    throw new MyError("Та зөвхөн өөрийнхөө номыг л устгах эрхтэй !!!", 403);
  }

  book.remove();

  res.status(200).json({
    success: true,
    data: book,
  });
});

exports.updateBook = asyncHandler(async (req, res, next) => {
  const book = await Book.findById(req.params.id);

  if (!book) {
    throw new MyError(req.params.id + " ID тэй ном алга", 404);
  }

  if (book.createdUser.toString() !== req.userId && req.userRole !== "admin") {
    throw new MyError("Та зөвхөн өөрийнхөө номыг л засах эрхтэй !!!", 403);
  }

  req.body.updatedUser = req.userId;

  for (let attr in req.body) {
    book[attr] = req.body[attr];
  }

  book.save();

  res.status(200).json({
    success: true,
    data: book,
  });
});

// PUT : /api/v1/book/:id/photo

exports.uploadBookPhoto = asyncHandler(async (req, res, next) => {
  const book = await Book.findById(req.params.id);

  if (!book) {
    throw new MyError(req.params.id + " ID тэй ном алга", 404);
  }

  // img upload file upload хийхийн тулд express-н express-fileupload гэдэг package - г хэрэглэнэ

  const file = req.files.file;
  if (!file.mimetype.startsWith("image")) {
    throw new MyError(
      file.mimetype + " ийм файл оруулахгүй, зураг л оруулна уу!",
      400
    );
  }
  if (file.size > process.env.MAX_UPLOAD_FILE_SIZE) {
    console.log(process.env.MAX_UPLOAD_FILE_SIZE);
    throw new MyError(" Файлын хэмжээ 40000 байтаас хэтрэхгүй!", 400);
  }

  file.name = `photo_${req.params.id}${path.parse(file.name).ext}`;

  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, function (err) {
    if (err) {
      throw new MyError(
        "Файл хуулахад алдаа гарлаа. Алдаа : " + err.message,
        400
      );
    }

    book.photo = file.name;
    book.save();
    res.status(200).json({
      success: true,
      data: file.name,
    });
  });
});
