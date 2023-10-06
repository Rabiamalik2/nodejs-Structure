const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const answerSchema = new mongoose.Schema({
  text: {
    type: String,
    // required: true,
  },
  type: {
    type: String,
    // required: true,
    enum: ["text", "multiple-choice", "checkbox", "dropdown"],
  },
  options: [
    {
      type: String,
    },
  ],
  answer: {
    type:  mongoose.Schema.Types.Mixed,
  },
});

const questionnaireAnswerSchema = new mongoose.Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "users",
  },
  QAnswers: [answerSchema],
});

const model = mongoose.model("questionnaireAnswers", questionnaireAnswerSchema);

module.exports = model;
