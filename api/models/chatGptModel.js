const mongoose = require("mongoose");
const userSchema = require("../models/userModel.js");
const Schema = mongoose.Schema;

const messageSchema = new mongoose.Schema({
  messages: [
    {
      _id: String,
      createdAt: { type: Date, default: Date.now },
      text: String,
      user: {
        _id: String,
        step: {
          type: Number,
          default: 1, 
        },
        questionaireKey:{
          type: Boolean,
          default: false,
        },
        firstname: String,
        lastname: String,
        phone: Number,
        email: String,
        password: String,
        imagePath: String,
        dob: String,
        gender: String,
        homeAddress: String,
      },
    },
  ],
  user: {
    type: Schema.Types.ObjectId,
    ref: "users",
  },
});

module.exports = mongoose.model("userChatGpts", messageSchema);
