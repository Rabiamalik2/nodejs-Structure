const express = require("express");

const router = express.Router();

const {
    storeMedData,
    storeDocData,
    storeVitalSigns,
    getVitalSigns,
  } = require("../controllers/userMedicalInfo.js");

//medicalInfo_routes

router.use("/medical", storeMedData, storeDocData, storeVitalSigns, getVitalSigns);

module.exports = router;

const medical_routes = router;
