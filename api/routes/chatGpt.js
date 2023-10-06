const express = require("express");

const router = express.Router();

const { CreatemessageApi, getAllMsgs } = require("../controllers/chat.js");

//chat_routes

router.use("/chatGptMsgs", CreatemessageApi , getAllMsgs);

module.exports = router;

const chatGpt_routes = router;