const mongoose = require('mongoose');

const motherTongueSchema = new mongoose.Schema({
  region: { type: String, required: true },
  languages: [{ name: { type: String, required: true } }] 
});

const MotherTongue = mongoose.model('MotherTongue', motherTongueSchema);

module.exports = MotherTongue;
