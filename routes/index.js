var express = require("express");
var router = express.Router();

const { LocalStorage } = require("node-localstorage");

var localStorage = new LocalStorage("./scrath");

/* GET home page. */
router.get("/", function (req, res, next) {
  var user;
  if (localStorage.getItem("user") != undefined) {
    user = JSON.parse(localStorage.getItem("user"));
  } else if (req.session.user != undefined) {
    user = JSON.parse(req.session.user);
  }
  res.render("index", {
    title: "Home | Library",
    user: user == null || user == undefined ? "" : user,
  });
});

//? Logout
router.get("/logout", function (req, res) {
  localStorage.clear();
  req.session.destroy(function (err) {
    if (err) {
      console.log(err);
    } else {
      res.redirect("/login");
    }
  });
});
module.exports = router;
