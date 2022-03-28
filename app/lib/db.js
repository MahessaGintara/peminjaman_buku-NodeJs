var mysql = require("mysql");
var connection = mysql.createConnection({
  host: "localhost",
  user: "root", // your mysql user
  password: "root", // your mysql password
  port: 3306, //port mysql
  database: "peminjaman_buku", // your database name
});
connection.connect(function (error) {
  if (!!error) {
    console.log(error);
  } else {
    console.log("Database Conected..!");
  }
});

module.exports = connection;
