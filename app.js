// ? =========================  [ Library ]  =========================
var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

// ? ====================  [ Additional Library ]  ===================
var bodyParser = require("body-parser");
var flash = require("express-flash");
var session = require("express-session");
var methodOverride = require("method-override");

// ? ==========================  [ Router ]  ==========================
var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var loginRouter = require("./routes/authentication/login");
var registerRouter = require("./routes/authentication/register");

var bookDashboardRouter = require("./routes/controllers/book-admin-dashboard");
var booksFormRouter = require("./routes/controllers/admin-books");
var categoriesFormRouter = require("./routes/controllers/admin-category");

var app = express();

//? ======================= [ view engine setup ] =====================
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  session({
    resave: true,
    saveUninitialized: true,
    secret: "library",
  })
);
app.use(flash());
app.use(
  methodOverride(function (req, res) {
    if (req.body && typeof req.body == "object" && "_method" in req.body) {
      var method = req.body._method;
      delete req.body._method;
      return method;
    }
  })
);
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

//? ======================= [ Router Declaretion ] =====================
app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/login", loginRouter);
app.use("/register", registerRouter);

app.use("/book-dashboard", bookDashboardRouter);
app.use("/book-dashboard/books-form", booksFormRouter);
app.use("/book-dashboard/category-form", categoriesFormRouter);

//? ============ [ Catch 404 and forward to error handler ] ============
app.use(function (req, res, next) {
  next(createError(404));
});

//? ========================== [ Error handler ] ========================
app.use(function (err, req, res, next) {
  //? ====== [ Set locals, only providing error in development ] =======
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  //? =================== [ render the error page ] ======================
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
