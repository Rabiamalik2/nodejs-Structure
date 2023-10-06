const express = require("express");

const router = express.Router();

const {
    uploadOneTimeQuestionaire,
    displayQuestionaire,
    storeQuestionaireAnswers,
  } = require("../controllers/questionaire.js");

router.use("/questionaire", uploadOneTimeQuestionaire, displayQuestionaire, storeQuestionaireAnswers);

module.exports = router;

const questionaire_routes = router;
