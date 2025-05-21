const mongoose = require('mongoose');

const heightSchema = new mongoose.Schema({
  feet_inches: { type: String, required: true }, // Height in Feet & Inches (e.g., "5' 10\"")
  meters: { type: Number, required: true } // Height in Meters (e.g., 1.78)
});

const Height = mongoose.model('Height', heightSchema);

module.exports = Height;
