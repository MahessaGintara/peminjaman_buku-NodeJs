const { LocalStorage } = require("node-localstorage");

var localStorage = new LocalStorage("./scrath");

var Auth = {
  is_admin: function (req, res, next) {
    var user;
    if (localStorage.getItem("user") != undefined) {
      user = JSON.parse(localStorage.getItem("user"));
    } else if (req.session.user != undefined) {
      user = JSON.parse(req.session.user);
    }
    if (user == undefined) {
      res.redirect("/login");
    } else {
      if (user[2] != 1) {
        res.redirect("/");
      } else {
        req.user = user;
        next();
      }
    }
  },
  is_login: function (req, res, next) {
    var user;
    if (localStorage.getItem("user") != undefined) {
      user = JSON.parse(localStorage.getItem("user"));
    } else if (req.session.user != undefined) {
      user = JSON.parse(req.session.user);
    }
    if (user == undefined) {
      res.redirect("/login");
    } else {
      req.user = user;
      next();
    }
  },
};

module.exports = Auth;
