const mongoose = require("mongoose");

const successStoryRequestSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Reference to User model
    required: true
  },
  name: {
    type: String,
    required: true
  },
  partnerName: {
    type: String,
    required: true
  },
  partnerPhone: {
    type: Number,
  },
  image: {
    type: String, // Cloudinary image URL or local path
    required: true
  },
  quote: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ["Pending", "Approved", "Rejected"],
    default: "Pending"
  }
}, { timestamps: true });

const SuccessStoryRequest = mongoose.model("SuccessStoryRequest", successStoryRequestSchema);
module.exports = SuccessStoryRequest;
