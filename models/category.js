const mongoose = require("mongoose");
const { transliteration, slugify } = require("transliteration");

const CategoryScheme = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Категорийн нэрийг оруулна уу.. "],
      unique: true,
      trim: true,
      maxlength: [50, "Категорийн нэрний урт 50 - тэмдэгтээс доош байна"],
    },
    slug: String,
    description: {
      type: String,
      required: [true, "Категорийн тайлбарыг заавал оруулах ёстой"],
      maxlength: [500, "Категорийн тайлбар 500 тэмдэгт байх ёстой"],
    },
    photo: {
      type: String,
      default: "no-photo.jpg",
    },
    averageRating: {
      type: Number,
      min: [1, "Rating хамгийн багадаа 1 байна"],
      max: [10, "Rating хамгийн ихдээ 10 байна"],
    },
    //Доорх шиг ганцхан юм зааж өгч байгаа бол averagePrice: Number гээд биччихэж болно
    averagePrice: {
      type: Number,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

CategoryScheme.virtual("books", {
  ref: "Book",
  localField: "_id",
  foreignField: "category",
  justOne: false,
});

CategoryScheme.pre("save", function (next) {
  // name - г хөрвүүлэх ажил хийнэ
  this.slug = slugify(this.name);
  // this.averagePrice = Math.floor(Math.random() * 100000) + 3000;
  this.averageRating = Math.floor(Math.random() * 10) + 1;
  next();
});
CategoryScheme.pre("remove", async function (next) {
  // name - г хөрвүүлэх ажил хийнэ
  console.log("removing....");
  await this.model("Book").deleteMany({ category: this._id });
});
module.exports = mongoose.model("Category", CategoryScheme);
