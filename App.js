require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");
const routes = require("./api/routes/routes.js");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 5000;
app.use(bodyParser.json());
app.use(cors());
const dbConnection = require("./api/services/db.js");
app.use("/api", routes );
app.get("/", (req, res)=>{
  res.send("working");
} )
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

