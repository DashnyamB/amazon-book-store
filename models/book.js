const mongoose = require("mongoose");
const { token } = require("morgan");
const { transliteration, slugify } = require("transliteration");

const BookScheme = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Номын нэрийг оруулна уу.. "],
      unique: true,
      trim: true,
      maxlength: [250, "Номын нэрний урт 50 - тэмдэгтээс доош байна"],
    },
    photo: {
      type: String,
      default: "no-photo.jpg",
    },
    author: {
      type: String,
      required: [true, "Зохиолчийн нэрийг оруулна уу.. "],
      trim: true,
      maxlength: [50, "Зохиолчийн нэрний урт 50 - тэмдэгтээс доош байна"],
    },
    rating: {
      type: Number,
      min: [1, "Rating хамгийн багадаа 1 байна"],
      max: [10, "Rating хамгийн ихдээ 10 байна"],
    },
    price: {
      type: Number,
      required: [true, "Номын үнэ оруулна уу.. "],
      min: [500, "Номын үнэ хамгийн багадаа 500 байна"],
    },
    balance: {
      type: Number,
    },
    content: {
      type: String,
      required: [true, "Номын тайлбарыг заавал оруулах ёстой"],
      maxlength: [5000, "Номын тайлбар 5000 тэмдэгт байх ёстой"],
    },
    bestseller: {
      type: Boolean,
      default: false,
    },
    available: [String],
    category: {
      type: mongoose.Schema.ObjectId,
      ref: "Category",
      required: true,
    },
    createdUser: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    updatedUser: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

BookScheme.statics.computeCategoryAveragePrice = async function (categoryId) {
  const objects = await this.aggregate([
    { $match: { category: categoryId } },
    { $group: { _id: "$category", avgPrice: { $avg: "$price" } } },
  ]);

  console.log(objects);

  await this.model("Category").findByIdAndUpdate(categoryId, {
    averagePrice: objects[0].avgPrice,
  });

  return objects;
};

BookScheme.post("save", function () {
  this.constructor.computeCategoryAveragePrice(this.category);
});
BookScheme.post("remove", function () {
  this.constructor.computeCategoryAveragePrice(this.category);
});
BookScheme.virtual("Zohiogch").get(function () {
  if (!this.author) return "";
  let tokens = this.author.split(" ");
  if (tokens.length === 1) tokens = this.author.split(".");
  if (tokens.length === 2) return tokens[1];

  return tokens;
});

module.exports = mongoose.model("Book", BookScheme);
