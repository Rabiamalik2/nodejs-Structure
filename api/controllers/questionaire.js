const express = require("express");
const router = express.Router();
const users = require("../models/userModel.js");
const adminsData = require("../models/oneTimeQuestionaireModel.js");
const questionnaireAnswers = require("../models/questionaireAnswersModel.js");
const { verifyToken } = require("../services/jwtService.js");
//array of questions

const uploadQuestionaire = [
  {
    title: "One-Time Questionaire",
    questions: [
      //1
      {
        text: "Do you have a family history of heart disease or stroke?",
        type: "checkbox",
        options: [
          "Yes, immediate family member",
          "Yes, extended family member",
          "No",
        ],
      },
      //2
      {
        text: "Have you ever been diagnosed with any of the following heart conditions?",
        type: "checkbox",
        options: [
          "Hypertension (high blood pressure)",
          "High cholesterol",
          "Coronary artery disease",
          "Arrhythmia (irregular heartbeat)",
          "Congestive heart failure",
          "None",
        ],
      },
      //3
      {
        text: "Do you smoke or use tobacco products?",
        type: "checkbox",
        options: ["Yes", "No"],
      },
      //4
      {
        text: "How often do you engage in physical activity or exercise?",
        type: "text",
      },
      //5
      {
        text: "Do you follow a balanced and heart-healthy diet?",
        type: "checkbox",
        options: ["Yes", "No"],
      },
      //6
      {
        text: "How many alcoholic beverages do you consume in a typical week?",
        type: "text",
      },
      //7
      {
        text: "Do you experience chronic stress or anxiety?",
        type: "checkbox",
        options: ["Yes", "No"],
      },
      //8
      {
        text: "Do you have a history of depression or other mental health conditions?",
        type: "checkbox",
        options: ["Yes", "No"],
      },
      //9
      {
        text: "Are you currently taking any prescription medications for heart-related conditions? If yes, please list them.",
        type: "text",
      },
      //10
      {
        text: "Do you take any dietary supplements or herbal products for heart health?",
        type: "text",
      },
    ],
  },
];
const uploadOneTimeQuestionaire = router.post("/",  async (req, res) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    await verifyToken(token);
    for (const questionnaire of uploadQuestionaire) {
      const newQuestionnaire = new adminsData(questionnaire);
      await newQuestionnaire.save();
    }
    res.status(201).json({ message: "Questionnaire uploaded successfully" });
  } catch (error) {
    console.error("Error uploading questionnaire:", error);
    res.status(500).json({ message: "Questionnaire upload failed" });
  }
});

//displaying questionaire

const displayQuestionaire = router.get("/",   async (req, res) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    await verifyToken(token);
    const { userID } = req.query;
    const user = await users.findById(userID).exec();
    if (user) {
      if (user.questionaireKey === false) {
        const questions = await adminsData.find({
          title: "One-Time Questionaire",
        });
        console.log("questions: ", questions);
        res.json(questions);
      } else {
        res.status(401).json({ message: "Already have filled Questionaire" });
      }
    } else {
      return res.status(401).send("User not found");
    }
  } catch (error) {
    console.error("Error fetching questionnaires:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

const storeQuestionaireAnswers = router.post("/answers" , async (req, res) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    await verifyToken(token);
    const { userID, questionnaireID, answers } = req.body;
    const { selectedAnswers } = answers;
    const user = await users.findById(userID).exec();
    let qAns = [];
    const questionaire = await adminsData.find(questionnaireID).exec();
    const questionaireQ = [...questionaire[0].questions];
    const questionids = questionaireQ.map((question) => question._id);
    // console.log(questionids,'ids')
    if (user) {
      if (user) {
        if (user.questionaireKey === false) {
          await users.findByIdAndUpdate(
            userID,
            { $set: { questionaireKey: true } },
            { new: true }
          );
        }
        for (const key in selectedAnswers) {
          const qAnswer = selectedAnswers[key];
          const answerID = key;
          const index = questionids.findIndex((questionid) =>
            questionid.equals(answerID)
          );
          if (index !== -1) {
            questionaire[0].questions[index].newField = qAnswer;
            // console.log("qAns: ", qAnswer);
            qAns.push({ ...questionaireQ[index], answer: qAnswer });
            // console.log(`Value ${key} found at index ${index}`);
          } else {
            // console.log(`Value ${key} not found in the array`);
          }
        }
        console.log("answersArray: ", qAns);
        const newQuesAns = new questionnaireAnswers({
          user,
          QAnswers: qAns,
        });
        await newQuesAns.save();
        console.log("Quesanswer: ", newQuesAns);

        return res.status(201).json({
          message: "Answers stored Successfully",
        });
      }
    }
  } catch (error) {
    console.error("Error storing answers:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
module.exports = {
  uploadOneTimeQuestionaire,
  displayQuestionaire,
  storeQuestionaireAnswers,
};
