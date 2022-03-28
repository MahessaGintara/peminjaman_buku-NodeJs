var express = require("express");
const { check, validationResult } = require("express-validator");
var router = express.Router();

var async = require("async");
var dbcon = require("../../app/lib/db");
var authentication = require("../../app/middleware/middleware");

//?         get admin page
router.get("/", authentication.is_admin, async function (req, res) {
  async.parallel(
    {
      books: function (callback) {
        var query =
          "SELECT books.books_id, books.book_name, books.image_url, books.books_creator, books.books_publisher, book_category.category_name, COUNT(book.books_id) AS jumlah_buku FROM books \
        LEFT JOIN book ON book.books_id = books.books_id \
        LEFT JOIN book_category ON books.category_id = book_category.category_id \
        GROUP BY book_name";
        dbcon.query(query, function (err, results) {
          callback(err, results);
        });
      },
      categories: function (callback) {
        var query = "SELECT * FROM book_category";
        dbcon.query(query, function (err, results) {
          callback(err, results);
        });
      },
    },
    function (err, results) {
      var books = results.books;
      var categories = results.categories;
      req.flash("msg_error", err);
      res.render("pages/admin-dashboard", {
        title: "Admin Dashboard | Library",
        books: books,
        categories: categories,
        user: req.user,
      });
    }
  );
});

module.exports = router;
