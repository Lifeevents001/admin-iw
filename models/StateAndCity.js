const mongoose = require("mongoose");

const citySchema = new mongoose.Schema({
  name: { type: String, required: true },
});

const stateSchema = new mongoose.Schema({
  state: { type: String, required: true, unique: true },
  cities: [citySchema], // Array of cities under each state
});

const State = mongoose.model("State", stateSchema);

module.exports = State;
