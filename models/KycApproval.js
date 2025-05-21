const mongoose = require("mongoose");

const kycSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Assuming your User model is named 'User'
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  approval: {
    type: Boolean,
    default: false // By default, KYC is not approved
  },
}, { timestamps: true });

const KYC = mongoose.model("KYC", kycSchema);

module.exports = KYC;
