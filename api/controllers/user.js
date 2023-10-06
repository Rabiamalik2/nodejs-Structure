const users = require("../models/userModel.js");
const jwt = require("jsonwebtoken");
const { verifyToken } = require("../services/jwtService.js");
const bcrypt = require("bcrypt");
const secretKey = "secretkey";
const saltRounds = 10;
const express = require("express");
const router = express.Router();

//Registration Code:

const createUser = router.post("/", async (req, res) => {
  try {
    const {
      firstname,
      lastname,
      phone,
      email,
      password,
      step,
      questionaireKey,
    } = req.body;
    const existingUser = await users.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email is already in use" });
    }
    bcrypt.genSalt(saltRounds, function (err, salt) {
      if (err) {
        throw err;
      } else {
        bcrypt.hash(password, salt, async (err, hashedPassword) => {
          if (err) {
            throw err;
          } else {
            const newUser = await users.create({
              step,
              firstname,
              lastname,
              phone,
              email,
              password: hashedPassword,
              imagePath: null,
              dob: null,
              gender: null,
              homeAddress: null,
              questionaireKey,
            });
            const token = jwt.sign({ userEmail: newUser.email }, secretKey, {
              expiresIn: "1h",
            });
            res.status(201).json({
              newUser,
              token,
              message: "Registration successful",
            });
          }
        });
      }
    });
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({ message: "Registration failed" });
  }
});

//displaying user

const getUser = router.get("/", async (req, res) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const decodedPayload = await verifyToken(token);
    const email = decodedPayload.userEmail;
    console.log(email);
    const user = await users.findOne({ email }).select("+password");
    return res.status(200).json({ message: "User", user });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).send("Internal Server Error");
  }
});

//Adding image path to user table:

const addImagePath = router.post("/addImage" ,async (req, res) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    await verifyToken(token);
    const { imagePath, email } = req.body;
    console.log(email);
    await users.findOneAndUpdate(
      { email },
      { $set: { imagePath } },
      { new: true }
    );
    console.log(imagePath);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

//Adding personal info data here:

const addPersonalData = router.put("/personalInfo",  async (req, res) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    await verifyToken(token);
    const { userID, dob, gender, homeAddress } = req.body;
    console.log("user  from add data:", userID);
    const updatedUser = await users.findByIdAndUpdate(
      userID,
      { $set: { dob, gender, homeAddress } },
      { new: true }
    );
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    console.log("Updated data:", updatedUser);

    res
      .status(200)
      .json({ message: "User data updated successfully", user: updatedUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

//Login Code:

const loginUser =  async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throw new ErrorHandler("Please Enter Email & Password", 400);
    }

    const user = await users.findOne({ email }).select("+password");
    if (!user) {
      throw new ErrorHandler("Authentication failed", 401);
    }
    bcrypt.compare(password, user.password, function (err, isMatch) {
      if (err) {
        throw err;
        // } else if (!isMatch) {
        //   console.log("pass1", password);
        //   console.log("pass2", user.password);
        //   console.log("Password doesn't match!");
        //   return res.status(400).json({ message: "Password doesn't match!" });
        // }
      } else {
        console.log(isMatch, "isMatch");
        console.log("Password matches!");
        const token = jwt.sign({ userEmail: user.email }, secretKey, {
          expiresIn: "1hr",
        });
        res.status(200).json({
          user,
          token,
          message: "Authentication successful",
        });
      }
    });
  } catch (error) {
    next(error);
  }
};

//updating password

const updatePassword = async (req, res) => {
  // const token = req.headers.authorization;
  // if (!token) {
  //   return res.status(401).json({ message: "Unauthorized" });
  // }
  try {
    // await verifyToken(token);
    const { email, password } = req.body;
    console.log(email);
    bcrypt.genSalt(saltRounds, function (err, salt) {
      if (err) {
        throw err;
      } else {
        bcrypt.hash(password, salt, async (err, hashedPassword) => {
          if (err) {
            throw err;
          } else {
            await users.findOneAndUpdate(
              { email },
              { $set: { password: hashedPassword } },
              { new: true }
            );
            console.log(password);
            const token = jwt.sign({ userEmail: email }, secretKey, {
              expiresIn: "1h",
            });
            res.status(201).json({
              email,
              password,
              token,
              message: "password updated successfully",
            });
          }
        });
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  createUser,
  loginUser,
  // tokenVerification,
  addImagePath,
  addPersonalData,
  getUser,
  updatePassword,
};
