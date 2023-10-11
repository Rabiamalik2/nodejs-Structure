const mongoose = require("mongoose");

var uri = "mongodb+srv://rabia:ruhi567@selfcheckupdb.fayy38d.mongodb.net/myDb?retryWrites=true&w=majority";

mongoose.connect(uri, { useUnifiedTopology: true, useNewUrlParser: true });

const connection = mongoose.connection;

connection.once("open", function() {
  console.log("MongoDB database connection established successfully");
});

module.exports = connection;