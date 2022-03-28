var express = require("express");
const { check, validationResult } = require("express-validator");
var router = express.Router();

var path = require("path");
var async = require("async");
var dbcon = require("../../app/lib/db");
var authentication = require("../../app/middleware/middleware");
const { unlinkSync } = require("fs");

// ?==================== [ Add Books page ] ====================
router.get("/", authentication.is_admin, function (req, res) {
  res.render("pages/categories-form", {
    title: "Library | Form Add Category",
    user: req.user,
    data: {
      category_name: "",
    },
  });
});

// ?==================== [ Add Books Post ] ====================
router.post(
  "/",
  authentication.is_admin,
  [
    //? validator
    check("category_name", "Fill the category name field").not().isEmpty(),
  ],
  function (req, res) {
    var errors = validationResult(req);
    if (!errors.isEmpty()) {
      errors_detail = "<p>Sory there are error</p><ul>";
      for (let i = 0; i < errors.errors.length; i++) {
        const error = errors.errors[i];
        errors_detail += "<li>" + error.msg + "</li>";
      }
      errors_detail += "</ul>";

      var body = req.body;
      req.flash("category_msg_error", errors_detail);
      res.render("pages/categories-form", {
        title: "Library | Form Add Category",
        data: {
          category_name:
            body.category_name == undefined ? "" : body.category_name,
        },
        user: req.user,
      });
    } else {
      var body = req.body;
      const query =
        "INSERT INTO book_category (category_name) VALUES ('" +
        body.category_name +
        "')";
      dbcon.query(query, function (err, result) {
        if (err) {
          console.log(err);
          if (err.code == "ER_DUP_ENTRY") {
            err.sqlMessage = "Category name already used.";
          }
          req.flash("category_msg_error", "<p>" + err.sqlMessage + "</p>");
          res.render("pages/categories-form", {
            title: "Library | Form Add Category",
            data: {
              category_name:
                body.category_name == undefined ? "" : body.category_name,
            },
            user: req.user,
          });
        } else {
          req.flash("category_msg_info", "Category Added");
          res.redirect("/book-dashboard");
        }
      });
    }
  }
);

router.get("/edit/(:id)", authentication.is_admin, function (req, res) {
  const query =
    "SELECT * FROM  book_category WHERE category_id=" + req.params.id;
  dbcon.query(query, function (err, results) {
    if (err) {
      var errors = "Error selecting " + err;
      req.flash("category_msg_error", errors);
      res.redirect("/book-dashboard");
    } else {
      if (results.length <= 1) {
        req.flash("category_msg_error", "Category not found");
        res.redirect("/book-dashboard");
      } else {
        res.render("pages/categories-form", {
          title: "Library | Form Add Category",
          user: req.user,
          data: {
            category_name: results[0].category_name,
            id: req.params.id,
          },
        });
      }
    }
  });
});
router.post(
  "/edit/(:id)",
  authentication.is_admin,
  [
    //? validator
    check("category_name", "Fill the category name field").not().isEmpty(),
  ],
  function (req, res) {
    var errors = validationResult(req);
    if (!errors.isEmpty()) {
      errors_detail = "<p>Sory there are error</p><ul>";
      for (let i = 0; i < errors.errors.length; i++) {
        const error = errors.errors[i];
        errors_detail += "<li>" + error.msg + "</li>";
      }
      errors_detail += "</ul>";

      var body = req.body;
      req.flash("category_msg_error", errors_detail);
      res.redirect("pages/categories-form/edit/" + req.params.id);
    } else {
      const query =
        "UPDATE book_category SET category_name = '" +
        req.body.category_name +
        "' WHERE category_id=" +
        req.params.id;
      dbcon.query(query, function (err) {
        if (err) {
          console.log(err);
          if (err.code == "ER_DUP_ENTRY") {
            err.sqlMessage = "Category name already used.";
          }
          req.flash("category_msg_error", "<p>" + err.sqlMessage + "</p>");
          res.redirect("/book-dashboard/category-form/edit/" + req.params.id);
        } else {
          console.log("success");
          req.flash("category_msg_info", "Update category success");
          res.redirect("/book-dashboard");
        }
      });
    }
  }
);
router.delete("/delete", authentication.is_admin, async (req, res) => {
  async.parallel(
    {
      unlinkSync: function (callback) {
        const query =
          "SELECT book_category.category_id, books.books_id, books.image_url FROM book_category \
          RIGHT JOIN books ON books.category_id = book_category.category_id \
          WHERE book_category.category_id =" +
          req.body.category_id;
        dbcon.query(query, async (err, results) => {
          if (err) {
            console.log(err);
            callback("Error get image url");
          } else {
            let deleted = 1;
            for (let index = 0; index < results.length; index++) {
              const element = results[index];
              var imageLocation = path.join(
                __dirname,
                "../../public/",
                element["image_url"]
              );
              unlinkSync(imageLocation);
              deleted++;
            }
            if (deleted == results.length) {
              callback("succcess");
            }
          }
        });
      },
      deleteCategory: function (callback) {
        dbcon.query(
          "DELETE FROM book_category WHERE category_id =" +
            req.body.category_id,
          async (err) => {
            if (err) {
              console.log(err);
              callback("Error deleting category");
            } else {
              callback("success");
            }
          }
        );
      },
    },
    function (callback) {
      console.log(callback);
      req.flash("category_msg_info", "Delete category success");
      res.redirect("/book-dashboard");
    }
  );
});

module.exports = router;
