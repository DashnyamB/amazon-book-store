const Category = require("../models/category");
const MyError = require("../utils/myError");
const asyncHandler = require("../middleware/asyncHandler");
const paginate = require("../utils/paginate");

exports.getCategories = asyncHandler(async (req, res, next) => {
  const select = req.query.select;
  const sort = req.query.sort;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 100;

  ["select", "sort", "page", "limit"].forEach((el) => delete req.query[el]);
  // pagination
  const pagination = await paginate(Category, page, limit);

  console.log(req.query);
  const categories = await Category.find(req.query)
    .select(select)
    .sort(sort)
    .skip(pagination.start - 1)
    .limit(limit);
  res.status(200).json({
    success: true,
    data: categories,
    pagination,
  });
});

exports.getCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id).populate("books");
  console.log(req.db);
  req.db.teacher.create({
    id: 2,
    name: "Батням",
    phone: "+976 88064500",
    password: "123456",
  });
  req.db.course.create({
    id: 1,
    name: "JS эхнээс нь дуустал",
    tailbar: "JS - н тухай бүх ойлголтуудыг эхнээс нь дуустал үзнэ",
    price: 49900,
    sequ,
  });

  if (!category) {
    throw new MyError(`${req.params.id} - ID - тай категори байхгүй`, 400);
  }

  res.status(200).json({
    success: true,
    data: category,
  });
});

exports.createCategory = asyncHandler(async (req, res, next) => {
  console.log("Data : ", req.body);

  const category = await Category.create(req.body);
  res.status(200).json({
    success: true,
    data: category,
  });
});

exports.deleteCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    throw new MyError(`${req.params.id} - тай категори байхгүй`, 400);
  }
  category.remove();

  res.status(200).json({
    success: true,
    data: category,
  });
});

exports.updateCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!category) {
    throw new MyError(`${req.params.id} - тай категори байхгүй`, 400);
  }

  res.status(200).json({
    success: true,
    data: category,
  });
});
