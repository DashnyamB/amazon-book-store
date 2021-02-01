const express = require("express");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");
const fileupload = require("express-fileupload");
const connectDB = require("./config/db");
const colors = require("colors");
const errorHandler = require("./middleware/error");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const logger = require("./middleware/logger");
const injectDb = require("./middleware/injectDb");
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const xss = require("xss-clean");
const rateLimit = require("express-rate-limit");
const hpp = require("hpp");
// Router оруулж ирэх
const categoriesRoutes = require("./routes/categories");
const booksRoutes = require("./routes/books");
const UsersRoutes = require("./routes/users");
const CommentsRoutes = require("./routes/comments");

// Аппын тохиргоог process.env руу ачааллах
dotenv.config({ path: "./config/config.env" });

const db = require("./config/db-mysql");

// Router;
const app = express();

connectDB();

var accessLogStream = fs.createWriteStream(path.join(__dirname, "access.log"), {
  flags: "a",
});

var whitelist = ["http://localhost:3000"];

var corsOptions = {
  origin: function (origin, callback) {
    console.log(origin);
    if ((origin === undefined || whitelist.indexOf(origin)) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  allowedHeaders: "Authorization, Set-Cookie, Content-Type",
  methods: "GET, POST, PUT, DELETE",
  credentials: true,
};

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "15 минутанд 100 удаа л хандаж болно",
});
app.use(express.static(path.join(__dirname, "public")));
// body parser
app.use(limiter);
app.use(hpp());
app.use(cookieParser());
app.use(express.json());
app.use(cors(corsOptions));
app.use(helmet());
app.use(mongoSanitize());
app.use(xss());

app.use(fileupload());
app.use(logger);
app.use(injectDb(db));
app.use(morgan("combined", { stream: accessLogStream }));
app.use("/api/v1/categories", categoriesRoutes);
app.use("/api/v1/books", booksRoutes);
app.use("/api/v1/users", UsersRoutes);
app.use("/api/v1/comments", CommentsRoutes);
app.use(errorHandler);

db.user.belongsToMany(db.book, {
  through: db.comments,
  onDelete: "CASCADE",
  onUpdate: "RESTRICT",
});

db.book.belongsToMany(db.user, {
  through: db.comments,
  onDelete: "CASCADE",
  onUpdate: "RESTRICT",
});

db.user.hasMany(db.comments);
db.comments.belongsTo(db.user);

db.book.hasMany(db.comments);
db.comments.belongsTo(db.book);

db.category.hasMany(db.book);
db.book.belongsTo(db.category);

db.sequelize
  .sync()
  .then((result) => {
    console.log("Sync хийгдлээ");
  })
  .catch((err) => {
    console.log("Sync хийхэд алдаа гарлаа. Алдаа : ", err);
  });

const server = app.listen(process.env.PORT, () => {
  console.log(
    `express server ${process.env.PORT} port deer aslaa`.rainbow.italic.bold
  );
});

process.on("unhandledRejection", (err, promise) => {
  console.log(`Алдаа гарчээ ${err.message}`.underline.red.bold);
  server.close(() => {
    process.exit(1);
  });
});
