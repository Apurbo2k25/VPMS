const mongoose = require("mongoose");

const visitorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },
    hostEmployee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    purpose: {
      type: String,
      required: true,
    },

    photo: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "CheckedIn", "CheckedOut", "Rejected"],
      default: "Pending",
    },

    visitDate: {
      type: Date,
      required: true,
    },
    checkInTime: {
      type: Date,
      default: null,
    },

    checkOutTime: {
      type: Date,
      default: null,
    },
    qrCode: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Visitor", visitorSchema);
