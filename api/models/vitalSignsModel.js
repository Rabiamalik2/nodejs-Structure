const mongoose = require("mongoose");

const Schema = mongoose.Schema;

let vitalSigns = new Schema({
  bloodPressure: String,
  bloodSugarLevel: String,
  pulse: String,
  bodyTemprature:String,
  user: {
    type: Schema.Types.ObjectId,
    ref: 'users' 
}
});

const model = mongoose.model("vitalSignsDb", vitalSigns);

module.exports = model;