const mongoose = require("mongoose");
const Ticket = require("../models/Ticket");
const ServiceLog = require("../models/ServiceLog");

// ✅ POST /service-logs  (Engineer adds a log)
const addServiceLog = async (req, res) => {
  try {
    const { ticketId, workNote } = req.body;

    if (!ticketId || !mongoose.Types.ObjectId.isValid(ticketId)) {
      return res.status(400).json({ message: "Valid ticketId is required" });
    }

    if (!workNote || String(workNote).trim().length === 0) {
      return res.status(400).json({ message: "workNote is required" });
    }

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    // ✅ Only assigned engineer should add logs
    if (ticket.assignedTo && String(ticket.assignedTo) !== String(req.user.id)) {
      return res.status(403).json({ message: "Not allowed to add logs to this ticket" });
    }

    const log = await ServiceLog.create({
      ticketId,
      engineerId: req.user.id,
      workNote,
    });

    return res.status(201).json({ message: "Service log added", log });
  } catch (err) {
    console.error("ADD SERVICE LOG ERROR:", err);
    return res.status(500).json({ message: "Failed to add service log" });
  }
};

// ✅ GET /service-logs/:ticketId
const getServiceLogsByTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(ticketId)) {
      return res.status(400).json({ message: "Invalid ticketId" });
    }

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    // ✅ Customer can view only their own ticket logs
    if (req.user.role === "customer") {
      if (String(ticket.createdBy) !== String(req.user.id)) {
        return res.status(403).json({
          message: "Not allowed to view logs for this ticket",
        });
      }
    }

    const logs = await ServiceLog.find({ ticketId })
      .populate("engineerId", "name email")
      .sort({ createdAt: -1 });

    return res.json({ logs });
  } catch (err) {
    console.error("GET SERVICE LOGS ERROR:", err);
    return res.status(500).json({ message: "Failed to load service logs" });
  }
};

module.exports = {
  addServiceLog,
  getServiceLogsByTicket,
};
