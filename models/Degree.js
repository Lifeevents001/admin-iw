const mongoose = require('mongoose');

const degreeSchema = new mongoose.Schema({
  category: { type: String, required: true }, // Category (e.g., Engineering, Medicine)
  degrees: [{ name: { type: String, required: true } }] // List of Degrees
});

const Degree = mongoose.model('Degree', degreeSchema);

module.exports = Degree;
