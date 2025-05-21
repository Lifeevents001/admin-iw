const mongoose = require("mongoose");

const PromoCodeSchema = new mongoose.Schema({
  code: String,
  discount: Number,
  usedBy: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      planId: { type: mongoose.Schema.Types.ObjectId, ref: "Plan" },
      usedAt: { type: Date, default: Date.now },
    }
  ]
});

module.exports = mongoose.model("PromoCode", PromoCodeSchema);
