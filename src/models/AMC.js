const mongoose = require("mongoose");

/**
 * AMC (Annual Maintenance Contract) Schema
 */
const amcSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    contractNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: ["active", "expired", "suspended"],
      default: "active",
    },

    coveredServices: {
      type: [String],
      default: [],
    },

    notes: {
      type: String,
      default: "",
    },

    // ✅ NEW: uploaded document path
    amcDocumentUrl: {
      type: String,
      default: "",
    },

    // ✅ NEW: soft delete (premium safe delete)
    isDeleted: {
      type: Boolean,
      default: false,
    },

    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.models.AMC || mongoose.model("AMC", amcSchema);

