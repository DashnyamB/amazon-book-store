const errorHandler = (err, req, res, next) => {
  console.log(err.stack.red.italic);

  const error = { ...err };

  error.message = err.message;

  if (error.name === "CastError") {
    error.message = "Энэ ID буруу бүтэцтэй ID байна";
    error.statusCode = 400;
  }
  if (error.message === "jwt malformed") {
    error.message = "Та заавал нэвтэрч байж энэ үйлдлийг хийх боломжтой";
    error.statusCode = 401;
  }
  if (error.code === 11000) {
    error.message = "Энэ талбарын утгыг давхардуулж өгч болохгүй ";
    error.statusCode = 400;
  }
  res.status(error.statusCode || 500).json({
    success: false,
    error,
  });
};

module.exports = errorHandler;
