const mongoose = require("mongoose");

const supportMessageSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  message: {
    type: String,
    required: true
  },
  isAdmin: {
    type: Boolean,
    default: false // False for user messages, true for admin replies
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const SupportMessage = mongoose.model("SupportMessage", supportMessageSchema);
module.exports = SupportMessage;
