const mongoose = require("mongoose");

const Schema = mongoose.Schema;

let doctorInfo = new Schema({
  docName: String,
  phoneNumber: String,
  insuranceName: String,
  user: {
    type: Schema.Types.ObjectId,
    ref: 'users' 
}
});

const model = mongoose.model("doctors", doctorInfo);

module.exports = model;