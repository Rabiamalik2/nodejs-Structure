const express = require("express");

const router = express.Router();

const {
  createUser,
  addImagePath,
  addPersonalData,
  getUser,
  loginUser,
  updatePassword,
} = require("../controllers/user.js");

//user_routes

router.use("/user", createUser, getUser, addPersonalData, addImagePath);

router.post("/login", loginUser);

router.post("/updatePassword", updatePassword);

module.exports = router;

const user_routes = router;
