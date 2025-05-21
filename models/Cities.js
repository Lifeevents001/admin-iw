const mongoose = require("mongoose");

const citySchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true }, // Unique city ID
  name: { type: String, required: true }, // City name
  state: { type: String, required: true } // State name
});

const City = mongoose.model("City", citySchema);

module.exports = City;
