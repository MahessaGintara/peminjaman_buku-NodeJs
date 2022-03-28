var express = require("express");
const { check, validationResult } = require("express-validator");
var router = express.Router();
var path = require("path");

var dbcon = require("../../app/lib/db");
var authentication = require("../../app/middleware/middleware");
var formidable = require("formidable");
const mv = require("mv");
const { unlinkSync } = require("fs");

// ?==================== [ Add Books page ] ====================
router.get("/", authentication.is_admin, function (req, res) {
  var query = "SELECT * FROM book_category";
  dbcon.query(query, function (err, results) {
    if (err) var error = err;
    if (results.length == 0) {
      req.flash("category_books_msg_error", "Please create category first");
      res.redirect("/book-dashboard");
    } else {
      req.flash("books_msg_error", error);
      res.render("pages/books-form", {
        title: "Library | Form Add Books",
        caregory: results,
        data: {
          books_name: "",
          category_id: "",
          books_creator: "",
          books_publisher: "",
          number_of_books: "",
        },
        user: req.user,
      });
    }
  });
});

// ?==================== [ Add Books Post ] ====================

router.post("/", authentication.is_admin, (req, res) => {
  var form = new formidable.IncomingForm();
  form.parse(req, (error, fields, files) => {
    //? image validate
    var oriName = files.book_image.originalFilename;
    const arrayFileName = oriName.split(".");
    var imageExt = arrayFileName[arrayFileName.length - 1];
    if (imageExt == "jpg" || imageExt == "jpeg" || imageExt == "png") {
      var oldpath = files.book_image.filepath;
      var dateTime = Date.now();
      var imagePath =
        "images/" +
        dateTime.toString() +
        "-" +
        files.book_image.originalFilename;
      var newpath = path.join(__dirname, "../../public/") + imagePath;
      mv(oldpath, newpath, (err) => {
        if (err) {
          renderBack(err, 1, fields, req, res);
        } else {
          // category_id	book_name	image_url	books_creator	books_publisher	release_date
          var form_data = {
            category_id: fields.category_id,
            book_name: fields.books_name,
            image_url: imagePath,
            books_creator: fields.books_creator,
            books_publisher: fields.books_publisher,
            number_of_books: fields.number_of_books,
            release_date: fields.release_date,
          };
          dbcon.query("INSERT INTO books SET ?", form_data, (err) => {
            if (err) {
              unlinkSync(newpath, (err) => {
                if (err) {
                  console.log(err);
                  res.redirect("/book-dashboard");
                }
              });
              if (err.code == "ER_DUP_ENTRY") {
                renderBack(
                  "The name of the book has ben used.",
                  0,
                  fields,
                  req,
                  res
                );
              } else {
                console.log(err);
                res.redirect("/book-dashboard/books-form");
              }
            } else {
              console.log("Success Added Books");
              req.flash("books_msg_info", "Success Added Books");
              res.redirect("/book-dashboard");
            }
          });
        }
      });
    } else {
      console.log("wrong file ekstension");
      errors_detail =
        "<p>Wrong image type please select jpg, jpeg or png file</p>";
      renderBack(errors_detail, 0, fields, req, res);
    }
  });
});

// ?==================== [ Edit Book ] ====================
router.get("/edit/(:id)", authentication.is_admin, (req, res) => {
  const query = "SELECT * FROM  books WHERE books_id=" + req.params.id;
  dbcon.query(query, function (err, results) {
    console.log(results);
    console.log(results.length);
    if (err) {
      var errors = "Error selecting " + err;
      req.flash("books_msg_error", errors);
      res.redirect("/book-dashboard");
    } else {
      console.log(results.length);
      if (results.length != 1) {
        req.flash("books_msg_error", "Book not found");
        res.redirect("/book-dashboard");
      } else {
        req.flash("books_msg_error", "Book found");
        res.redirect("/book-dashboard");
      }
    }
  });
});

// ?==================== [ Delete Books ] ====================
router.delete("/delete", authentication.is_admin, (req, res) => {
  console.log(req.body);
  var imageLocation = path.join(__dirname, "../../public/", req.body.image_url);
  console.log(imageLocation);
  dbcon.query(
    "DELETE FROM books WHERE books_id =" + req.body.books_id,
    (err) => {
      if (err) {
        console.log(err);
        req.flash("books_msg_error", "Error deleting books");
        res.redirect("/book-dashboard");
      } else {
        unlinkSync(imageLocation);
        req.flash("books_msg_info", "Books deleted");
        res.redirect("/book-dashboard");
      }
    }
  );
});

module.exports = router;

function renderBack(msg, isError, data, req, res) {
  var query = "SELECT * FROM book_category";
  dbcon.query(query, function (err, results) {
    if (err) var error = err;
    if (results.length == 0) {
      req.flash("category_books_msg_info", "Please create category first");
      res.redirect("/book-dashboard");
    } else {
      if (isError == 0) {
        req.flash("books_msg_info", msg);
      } else {
        req.flash("books_msg_error", msg);
      }
      res.render("pages/books-form", {
        title: "Library | Form Add Books",
        caregory: results,
        data: {
          books_name: data.books_name,
          category_id: data.category_id,
          books_creator: data.books_creator,
          books_publisher: data.books_publisher,
          number_of_books: data.number_of_books,
          release_date: data.release_date,
        },
        user: req.user,
      });
    }
  });
}
