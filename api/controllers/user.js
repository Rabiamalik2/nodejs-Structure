const users = require("../models/userModel.js");
const jwt = require("jsonwebtoken");
const { verifyToken } = require("../services/jwtService.js");
const bcrypt = require("bcrypt");
const secretKey = "secretkey";
const saltRounds = 10;
const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const { generateResetCode } = require("../services/code.js");
const { google } = require("googleapis");
const { OAuth2Client } = require("google-auth-library");
/*POPULATE BELOW FIELDS WITH YOUR CREDETIALS*/

const CLIENT_ID =
  "416536186096-rvpm7dp5iig0oasn1snr6r63flcsemoa.apps.googleusercontent.com";
const CLIENT_SECRET = "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";
const REFRESH_TOKEN =
  "1//04soVA-8F8ZO3CgYIARAAGAQSNwF-L9IrZVsKYr1oI6xqzkQ_jlcBHerHXk6A1GumViNEN5WF5-b0U-HCRgofKbY-0ter3zjkl0o";
const REDIRECT_URI = "https://developers.google.com/oauthplayground"; //DONT EDIT THIS
const MY_EMAIL = "rabiam037@gmail.com";

/*POPULATE ABOVE FIELDS WITH YOUR CREDETIALS*/

const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

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

//deleting user:

const deleteUser = router.delete("/", async (req, res) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    await verifyToken(token);
    const { userID } = req.query;
    console.log(userID);
    const user = await users.findById(userID).exec();
    if (user) {
      const deletedUser = await users.findByIdAndRemove({ _id: userID }).exec();
      if (!deletedUser) {
        return res.status(404).json({ message: "Failed to delete user" });
      }
      return res
        .status(204)
        .json({ message: "User deleted successfully", deletedUser });
    }
  } catch (error) {
    console.error("Error updating contact:", error);
    return res.status(500).json({ message: "Contact not updated" });
  }
});

//Adding image path to user table:

const addImagePath = router.post("/addImage", async (req, res) => {
  try {
    const { email, imagePath } = req.body;
    console.log("imageEmail", email);
    await users.findOneAndUpdate(
      { email },
      { $set: { imagePath } },
      { new: true }
    );
    console.log(imagePath);
    res.status(200).json({ message: "image added successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

//Adding personal info data here:

const addPersonalData = router.put("/personalInfo", async (req, res) => {
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

const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    console.log(email, password);
    const normalizedEmail = email.toLowerCase();
    console.log(normalizedEmail);
    if (!email || !password) {
      return res.status(400).json({ message: "Please Enter Email & Password" });
    }
    const user = await users
      .findOne({ email: normalizedEmail })
      .select("+password");
    if (!user) {
      console.error("User not found");
      return res.status(404).json({ message: "User not found" });
    }
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        console.error("Error comparing passwords:", err);
        return res.status(500).json({ message: "Internal server error" });
      } else if (!isMatch) {
        console.log("Password doesn't match!");
        return res.status(401).json({ message: "Password doesn't match!" });
      } else {
        console.log("Password matches!");
        const token = jwt.sign({ userEmail: user.email }, secretKey, {
          expiresIn: "1hr",
        });
        console.log(user);
        res.status(200).json({
          user,
          token,
          message: "Authentication successful",
        });
      }
    });
  } catch (error) {
    console.error("Error during login:", error);
    return res.status(500).json({ message: "Internal server error", error });
  }
};

const resetCode = generateResetCode();
const sendResetCodeToEmail = async (req, res) => {
  try {
    const { userEmail } = req.body;
    console.log(userEmail, "userEmail");

    const ACCESS_TOKEN = await oAuth2Client.getAccessToken();
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: MY_EMAIL,
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken: ACCESS_TOKEN,
      },
      tls: {
        rejectUnauthorized: true,
      },
    });
    const mailOptions = {
      from: "rabiam037@gmail.com",
      to: userEmail,
      subject: "Password Reset Code",
      text: `Your password reset code is: ${resetCode}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
      } else {
        console.log("Email sent:", info.response);
        res.json({ message: "Email Sent" });
      }
    });
  } catch (error) {
    next(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
const confirmResetCode = async (req, res) => {
  const { code } = req.body;
  console.log("code ", code);
  if (code == resetCode) {
    res.status(201).json({ message: "Code Matched" });
    console.log("code matched");
  } else {
    res.json({ message: "Code Did not Match" });
  }
};

//updating password

const updatePassword = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(email, password);
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

const signinwithGoogle = async (req, res) => {
  try {
    const { email, idToken } = req.body;
    console.log(email, idToken);
    const normalizedEmail = email.toLowerCase();

    const ticket = await client.verifyIdToken({
      idToken: idToken,
      audience: CLIENT_ID,
    });

    if (ticket) {
      const payload = ticket.getPayload();
      const userId = payload.sub; // Google user ID

      const user = await users.findOne({ email: normalizedEmail });
      if (!user) {
        console.error("User not found");
        return res.status(404).json({ message: "User not found" });
      }

      // Verify that the Google user ID matches your user database
      if (userId === user.googleUserId) {
        console.log("User authenticated successfully.");

        // Create a JWT token
        const token = jwt.sign({ userEmail: user.email }, secretKey, {
          expiresIn: "1hr",
        });

        console.log(user);

        res.status(200).json({
          user,
          token,
          message: "Authentication successful",
        });
      } else {
        console.log("Tokens do not match. Access denied.");
        return res.status(401).json({ message: "Access denied" });
      }
    } else {
      console.log("Invalid token");
      return res.status(401).json({ message: "Invalid token" });
    }
  } catch (error) {
    console.error("Error during login through Google:", error);
    return res.status(500).json({ message: "Internal server error", error });
  }
};

module.exports = {
  createUser,
  getUser,
  deleteUser,
  addImagePath,
  addPersonalData,
  loginUser,
  updatePassword,
  sendResetCodeToEmail,
  confirmResetCode,
  signinwithGoogle,
};
