const Ticket = require("../models/Ticket");


/**
 * Create Ticket (Customer)
 * Accepts { title, description, priority }
 */
exports.createTicket = async (req, res) => {
  try {
    const { title, description, priority } = req.body;

    if (!title || !description || !priority) {
      return res.status(400).json({
        message: "title, description and priority are required",
      });
    }
    
    const fileUrl = req.file ? `/uploads/${req.file.filename}` : "";
    const ticket = await Ticket.create({
      title: String(title).trim(),
      description: String(description).trim(),
      priority: String(priority).toLowerCase(),
      createdBy: req.user.id,
      attachmentUrl: fileUrl,
      // status comes from schema default
    });

    res.status(201).json(ticket);
  } catch (error) {
    console.error("CREATE TICKET ERROR:", error.message);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Assign ticket (Admin)
 */
exports.assignTicket = async (req, res) => {
  try {
    const { ticketId, engineerId } = req.body;

    if (!ticketId) {
      return res.status(400).json({ message: "Ticket ID is required" });
    }

    if (!engineerId) {
      return res.status(400).json({ message: "Engineer ID is required" });
    }

    // ✅ Find ticket by _id OR by ticketId (if you use ticketId field)
    const ticket = await Ticket.findOne({
      $or: [{ _id: ticketId }, { ticketId: ticketId }],
    });

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    ticket.assignedTo = engineerId;
    await ticket.save();

    const Notification = require("../models/Notification");

await Notification.create({
  user: engineerId,
  message: "A ticket has been assigned to you",
  type: "ticket",
});


    res.status(200).json({
      message: "Ticket assigned successfully",
      ticket,
    });
  } catch (error) {
    console.error("ASSIGN TICKET ERROR:", error.message);
    res.status(500).json({ message: error.message });
  }
};


/**
 * Update ticket status (workflow enforced)
 */
exports.updateTicketStatus = async (req, res) => {
  try {
    const { status: newStatus } = req.body;

    const ticket = await Ticket.findById(req.params.ticketId);
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    const allowedTransitions = {
      open: ["in-progress"],
      "in-progress": ["resolved"],
      resolved: ["closed"],
      closed: [],
    };

    if (!allowedTransitions[ticket.status].includes(newStatus)) {
      return res.status(400).json({
        message: `Cannot change status from ${ticket.status} to ${newStatus}`,
      });
    }

    const oldStatus = ticket.status;
    ticket.status = newStatus;

    // ✅ history
    ticket.history.push({
      statusFrom: oldStatus,
      statusTo: newStatus,
      changedBy: req.user.id,
    });

    if (newStatus === "resolved") {
      ticket.resolvedAt = new Date();
    }

    await ticket.save();
    await Notification.create({
  user: ticket.createdBy,
  message: `Your ticket status changed to ${newStatus}`,
  type: "ticket",
});


    res.status(200).json({
      message: "Ticket status updated successfully",
      ticket,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get single ticket
 * Admin: any ticket
 * Customer: only own ticket
 * Engineer: only assigned ticket (if assignedTo exists)
 */
exports.getTicketById = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.ticketId)
      .populate("createdBy", "email role name fullName")
      .populate("assignedTo", "email role name fullName");

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    // ✅ Customer can only view their own ticket
    if (req.user.role === "customer") {
      if (String(ticket.createdBy?._id) !== String(req.user.id)) {
        return res.status(403).json({ message: "Access denied" });
      }
    }

    // ✅ Engineer can only view assigned ticket (if it is assigned)
    if (req.user.role === "engineer") {
      if (
        ticket.assignedTo &&
        String(ticket.assignedTo?._id) !== String(req.user.id)
      ) {
        return res.status(403).json({ message: "Access denied" });
      }
    }

    res.status(200).json(ticket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * List tickets with filters & pagination
 * Admin / Engineer / Customer
 */

exports.getTickets = async (req, res) => {
  try {
    const {
      status,
      priority,
      search,
      page = 1,
      limit = 10,
    } = req.query;

    const query = {};

    // 🔐 Role-based filtering
    if (req.user.role === "customer") {
      query.createdBy = req.user.id;
    }

    if (req.user.role === "engineer") {
      query.assignedTo = req.user.id;
    }

    // 🎯 Filters
    if (status) query.status = status;
    if (priority) query.priority = priority;

    // 🔍 SEARCH (FIXED)
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { ticketId: { $regex: search, $options: "i" } },
      ];
    }

    const tickets = await Ticket.find(query)
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const total = await Ticket.countDocuments(query);

    res.status(200).json({
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      tickets,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
