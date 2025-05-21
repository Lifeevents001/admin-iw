const mongoose = require("mongoose");

const RestrictedWordSchema = new mongoose.Schema({
  word: { type: String, required: true, unique: true }
});

const RestrictedWord = mongoose.model("RestrictedWord", RestrictedWordSchema);
module.exports = RestrictedWord;
