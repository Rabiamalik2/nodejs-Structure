const mongoose = require("mongoose");

const Schema = mongoose.Schema;

let medicalInfo = new Schema({

  mediQues: String,
  mediID: String,
  insuranceName: String,
  insuranceId: String,
  user: {
    type: Schema.Types.ObjectId,  
    ref: 'users' 
}
});

const model = mongoose.model("medicare", medicalInfo);

module.exports = model;