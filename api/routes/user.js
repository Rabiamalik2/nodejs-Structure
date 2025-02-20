const express = require("express");

const router = express.Router();

const {
  createUser,
  deleteUser,
  addImagePath,
  addPersonalData,
  getUser,
  loginUser,
  updatePassword,
  sendResetCodeToEmail,
  confirmResetCode,
  signinwithGoogle,
  facebookLogin,
} = require("../controllers/user.js");

//user_routes

router.use(
  "/user",
  createUser,
  getUser,
  deleteUser,
  addPersonalData,
  addImagePath
);

router.post("/login", loginUser);

router.post("/resetPassword", sendResetCodeToEmail);

router.post("/codeConfirmation", confirmResetCode);

router.put("/updatePassword", updatePassword);

router.post("/googleLogin", signinwithGoogle);

router.post("/fbLogin", facebookLogin);

router;

module.exports = router;

const user_routes = router;
