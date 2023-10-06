const express = require("express");

const router = express.Router();

const user_routes = require("../routes/user.js");
const contacts_routes = require("../routes/contacts.js");
const medical_routes = require("../routes/medical.js");
const chatGpt_routes = require("../routes/chatGpt.js");
const questionaire_routes = require("../routes/questionaire.js");

router.use("/", user_routes, contacts_routes, medical_routes, chatGpt_routes, questionaire_routes );

module.exports = router;

const routes = router;