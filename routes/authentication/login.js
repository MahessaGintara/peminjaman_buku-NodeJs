var express = require("express");
var router = express.Router();

const { check, validationResult } = require("express-validator");
const { LocalStorage } = require("node-localstorage");
const bcrypt = require("bcrypt");

const localStorage = new LocalStorage("./scrath");
var dbcon = require("../../app/lib/db");

var session_store;

//?Login Page Route

router.get("/", function (req, res, next) {
  res.render("auth/login", {
    email: req.body.txtEmail == undefined ? "" : req.body.txtEmail,
    password: req.body.txtPassword == undefined ? "" : req.body.txtPassword,
    title: "Login Page",
  });
});
router.post(
  "/",
  [
    check("txtEmail", "Your email is not valid")
      .not()
      .isEmpty()
      .isEmail()
      .normalizeEmail(),
    check("txtPassword", "Fill the password field").not().isEmpty(),
  ],
  function (req, res) {
    const errors = validationResult(req);
    console.log(req.body);

    if (!errors.isEmpty()) {
      //? validator error responses
      errors_detail = "<p>Sory there are error</p><ul>";
      for (let i = 0; i < errors.errors.length; i++) {
        const error = errors.errors[i];
        errors_detail += "<li>" + error.msg + "</li>";
      }
      errors_detail += "</ul>";
      req.flash("msg_error", errors_detail);
      res.render("auth/login", {
        email: req.body.txtEmail == undefined ? "" : req.body.txtEmail,
        password: req.body.txtPassword == undefined ? "" : req.body.txtPassword,
      });
    } else {
      const data = req.body;

      session_store = req.session;
      let email = req.body.txtEmail;
      let password = req.body.txtPassword;

      dbcon.query(
        'SELECT * FROM users WHERE email="' + email + '"',
        function (err, results) {
          if (err) {
            req.flash("msg_error", "<p>" + err + "</p>");
            res.render("auth/login", {
              email: req.body.txtEmail == undefined ? "" : req.body.txtEmail,
              password:
                req.body.txtPassword == undefined ? "" : req.body.txtPassword,
            });
          } else {
            if (results.length < 1) {
              req.flash("msg_error", "<p> Email does not exits </p>");
              res.render("auth/login", {
                email: req.body.txtEmail == undefined ? "" : req.body.txtEmail,
                password:  req.body.txtPassword == undefined ? "" : req.body.txtPassword,
              });
            } else {
              bcrypt.compare(
                password,
                results[0].password,
                function (err, result) {
                  if (!result) {
                    req.flash(
                      "msg_error",
                      "<p> Email and password does not match </p>"
                    );
                    res.render("auth/login", {
                      email:
                        req.body.txtEmail == undefined ? "" : req.body.txtEmail,
                      password:
                        req.body.txtPassword == undefined
                          ? ""
                          : req.body.txtPassword,
                    });
                  } else {
                    var user = JSON.stringify([
                      results[0].name,
                      results[0].email,
                      results[0].isAdmin,
                    ]);
                    console.log(req.body.boolRemember);
                    if (req.body.boolRemember != 1) {
                      localStorage.setItem("user", user);
                    } else {
                      session_store.user = user;
                    }
                    res.redirect("/");
                  }
                }
              );
            }
          }
        }
      );
    }
  }
);

module.exports = router;
