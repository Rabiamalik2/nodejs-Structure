const mongoose = require("mongoose");

var uri = "mongodb://127.0.0.1:27017/myDb";

mongoose.connect(uri, { useUnifiedTopology: true, useNewUrlParser: true });

const connection = mongoose.connection;

connection.once("open", function() {
  console.log("MongoDB database connection established successfully");
});

module.exports = connection;