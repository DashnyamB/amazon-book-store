const User = require("../models/user");
const MyError = require("../utils/myError");
const asyncHandler = require("../middleware/asyncHandler");
const paginate = require("../utils/paginate");
const sendEmail = require("../utils/email");
const crypto = require("crypto");

// Register
exports.register = asyncHandler(async (req, res, next) => {
  const user = await User.create(req.body);

  const token = user.getJsonWebToken();

  res.status(200).json({
    success: true,
    user: user,
    token,
  });
});

// login хийнэ
exports.login = asyncHandler(async (req, res, next) => {
  // Оролтоо шалгана
  const { email, password } = req.body;
  if (!email || !password) {
    throw new MyError("Имэйлээ болон нууц үгээ дамжуулна уу!", 400);
  }

  //   Тухайн хэрэглэгчийг хайна
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    throw new MyError("Имэйл, нууц үгээ зөв оруулна уу!", 401);
  }

  //   Нууц үгээ шалгана

  const isOk = await user.checkPassword(password);

  if (!isOk) {
    throw new MyError("Имэйл, нууц үгээ зөв оруулна уу!", 401);
  }

  const token = user.getJsonWebToken();

  cookieOption = {
    expires: new Date(Date.now() * 30 * 24 * 60 * 60 * 1000),
    httpOnly: true,
  };

  res.status(200).cookie("amazon-token", token, cookieOption).json({
    success: true,
    user: user,
    token,
  });
});

exports.logout = asyncHandler(async (req, res, next) => {
  cookieOption = {
    expires: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    httpOnly: true,
  };

  res.status(200).cookie("amazon-token", null, cookieOption).json({
    success: true,
    data: "Logged out",
  });
});

exports.getUsers = asyncHandler(async (req, res, next) => {
  const select = req.query.select;
  const sort = req.query.sort;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  ["select", "sort", "page", "limit"].forEach((el) => delete req.query[el]);
  // pagination
  const pagination = await paginate(User, page, limit);

  console.log(req.query);

  const users = await User.find(req.query)
    .select(select)
    .sort(sort)
    .skip(pagination.start - 1)
    .limit(limit);

  res.status(200).json({
    success: true,
    data: users,
    pagination,
  });
});

exports.getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new MyError(`${req.params.id} - ID - тай хэрэглэгч байхгүй`, 400);
  }

  res.status(200).json({
    success: true,
    data: user,
  });
});

exports.createUser = asyncHandler(async (req, res, next) => {
  const user = await User.create(req.body);
  res.status(200).json({
    success: true,
    data: user,
  });
});

exports.deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new MyError(`${req.params.id} - тай хэрэглэгч байхгүй`, 400);
  }
  user.remove();

  res.status(200).json({
    success: true,
    data: user,
  });
});

exports.updateUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    throw new MyError(`${req.params.id} - тай хэрэглэгч байхгүй`, 400);
  }

  res.status(200).json({
    success: true,
    data: user,
  });
});

exports.forgotPassword = asyncHandler(async (req, res, next) => {
  if (!req.body.email) {
    throw new MyError("Та нууц үг сэргээх имэйл хаягаа дамжуулна уу...", 400);
  }
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    throw new MyError(`${req.body.email} - имэйлтэй хэрэглэгч байхгүй`, 400);
  }

  const resetToken = user.generatePasswordChangeToken();
  await user.save();
  //   Имэйл илгээнэ
  const link = `https://amazon.mn/changepassword/${resetToken}`;
  const message = `<h4>Сайн байна уу.</h4> <br><br> Та нууц үг солих хүсэлт илгээлээ. Нууц үгээ доорх холбоос дээр дарж солино уу :<br><br> <a href="${link}">Энд дарж солино уу..</a> <br><br> Өдрийг сайхан өнгөрүүлээрэй`;
  const info = await sendEmail({
    email: user.email,
    subject: "Нууц үг сэргээх",
    message,
  });
  res.status(200).json({
    success: true,
    resetToken,
    message,
  });
});

exports.resetPassword = asyncHandler(async (req, res, next) => {
  if (!req.body.resetToken || !req.body.password) {
    throw new MyError("Token болон нууц үгээ дамжуулна уу...", 400);
  }
  const encrypted = crypto
    .createHash("sha256")
    .update(req.body.resetToken)
    .digest("hex");
  const user = await User.findOne({
    resetPasswordToken: encrypted,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    throw new MyError(`Хүчингүй token байна`, 400);
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  const token = user.getJsonWebToken();
  await user.save();

  res.status(200).json({
    success: true,
    token,
    user,
  });
});
