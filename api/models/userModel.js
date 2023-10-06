const mongoose = require("mongoose");

const Schema = mongoose.Schema;

let userSchema = new Schema({
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
});

const model = mongoose.model("users", userSchema);

module.exports = model;