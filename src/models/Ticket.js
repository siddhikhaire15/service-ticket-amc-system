const mongoose = require("mongoose");

const ticketHistorySchema = new mongoose.Schema(
  {
    statusFrom: {
      type: String,
      enum: ["open", "in-progress", "resolved", "closed"],
      required: true,
    },
    statusTo: {
      type: String,
      enum: ["open", "in-progress", "resolved", "closed"],
      required: true,
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    changedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const TicketSchema = new mongoose.Schema(
  {
    ticketId: {
      type: String,
      default: "",
    },

    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
    },

    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 8,
    },

    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },

    status: {
      type: String,
      enum: ["open", "in-progress", "resolved", "closed"],
      default: "open",
    },

    attachmentUrl: {
      type: String,
      default: "",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    resolvedAt: {
      type: Date,
      default: null,
    },

    history: {
      type: [ticketHistorySchema],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Ticket", TicketSchema);
