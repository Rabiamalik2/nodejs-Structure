const express = require("express");
const router = express.Router();
const users = require("../models/userModel.js");
const doctors = require("../models/doctorModel.js");
const medicare = require("../models/medicalModel.js");
const vitalSignsDb = require("../models/vitalSignsModel.js");
const { verifyToken } = require("../services/jwtService.js");

//Creating store med data:

const storeMedData = router.post("/storemedicoreData",  async (req, res) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    await verifyToken(token);
    const { userID, mediQues, mediID, insuranceName, insuranceId } = req.body;
    const user = await users.findById(userID).exec();
    if (user) {
      const medInfo = await medicare.create({
        mediQues,
        mediID,
        insuranceName,
        insuranceId,
        user,
      });
      return res
        .status(200)
        .json({ medInfo, message: "Medicore Info Added Successfully" });
    } else {
      return res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error("Error adding Medicore Info:", error);
    return res.status(500).json({ message: "Info Adding failed" });
  }
});

//Creating store doc data:

const storeDocData = router.post("/storedoctorData", async (req, res) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    await verifyToken(token);
    const { userID, docName, phoneNumber, insuranceName } = req.body;
    const user = await users.findById(userID).exec();
    if (user) {
      const docInfo = await doctors.create({
        docName,
        phoneNumber,
        insuranceName,
        user,
      });
      return res
        .status(200)
        .json({ docInfo, message: "Doctor Info Added Successfully" });
    } else {
      return res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error("Error adding Doctor Info:", error);
    return res.status(500).json({ message: "Info Adding failed" });
  }
});

//Storing VitalSigns:

const storeVitalSigns = router.post("/vitalData", async (req, res) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    await verifyToken(token);
    const { userID, bloodPressure, bloodSugarLevel, pulse, bodyTemprature } =
      req.body;
    const user = await users.findById(userID).exec();
    // console.log("11", user);
    if (user) {
      const signs = await vitalSignsDb.findOne({ user });
      console.log("sign", signs);
      if (signs) {
        const updatedVSigns = await vitalSignsDb.findOneAndUpdate(
          signs._id,
          { $set: { bloodPressure, bloodSugarLevel, pulse, bodyTemprature } },
          { new: true }
        );
        return res
          .status(200)
          .json({ updatedVSigns, message: "Vital Signs updated Successfully" });
      } else if (!signs) {
        const vitalSigns = await vitalSignsDb.create({
          bloodPressure,
          bloodSugarLevel,
          pulse,
          bodyTemprature,
          user,
        });
        return res
          .status(200)
          .json({ vitalSigns, message: "Vital Signs Added Successfully" });
      }
    } else {
      return res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error("Error adding Vital signs:", error);
    return res.status(500).json({ message: "Vital Signs Adding failed" });
  }
});

//displaying vital signs

const getVitalSigns = router.get("/vitalData", async (req, res) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    await verifyToken(token);
    const { userID } = req.query;
    console.log("user from vitals", userID);
    const user = await vitalSignsDb.find({ user: userID });
    if (user) {
      console.log("Vital Signs:", user);
      res.status(200).json(user);
    } else {
      return res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error("Error Detected:", error);
    return res.status(500).json({ message: "Failure" });
  }
});

module.exports = {
  storeMedData,
  storeDocData,
  storeVitalSigns,
  getVitalSigns,
};
