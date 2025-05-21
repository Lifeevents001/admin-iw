const mongoose = require("mongoose");
const User = require("../models/User");

const KundaliMatchSchema = new mongoose.Schema({
    requesterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    requesterName: {
        type: String,
        required: true
    },
    matchWithId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    matchWithName: {
        type: String,
        required: true
    },
    pdfLink: {
        type: String,
        default: null
    },
    approved: {
        type: Boolean,
        default: false
    },
    requestedAt: {
        type: Date,
        default: Date.now
    }
});

KundaliMatchSchema.pre("save", function(next) {
    if (this.pdfLink) {
        this.approved = true;
    }
    next();
});

module.exports = mongoose.model("KundaliMatch", KundaliMatchSchema);
