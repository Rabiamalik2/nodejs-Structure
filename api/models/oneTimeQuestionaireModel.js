const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: ["text", "multiple-choice", "checkbox", "dropdown"],
  },
  options: [
    {
      type: String,
    },
  ],
});

const adminData = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  questions: [questionSchema],
});

const model = mongoose.model("adminsData", adminData);

module.exports = model;
