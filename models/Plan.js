const mongoose = require("mongoose");

const PlanSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // Ensure unique plan names
  price: { type: Number, required: true },
  features: {
    views: { type: Number, default: 0 }, // Default unlimited
    chats: { type: Number, default: Infinity }, // Default unlimited
    contacts: { type: Number, default: 0 }, // Default unlimited
    intrests: { type: Number, default: 0 },
    shortlis: { type: Number, default: 0 }

  },
  durationInDays: { type: Number, required: true } // Plan duration (e.g., 30 days)
});

module.exports = mongoose.model("Plan", PlanSchema);
