const mongoose = require("mongoose");

const Schema = mongoose.Schema;
let contact = new Schema({
    firstname: String,
    lastname: String,
    phone: Number,
    relation: String,
    user: {
      type: Schema.Types.ObjectId,
      ref: 'users' 
  }
  });

module.exports = mongoose.model('contacts', contact);