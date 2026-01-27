const express = require("express");
const protect = require("../middlewares/authMiddleware");
const { authorizeRoles } = require("../middlewares/roleMiddleware");

const upload = require("../middlewares/uploadMiddleware");

const {
  createTicket,
  assignTicket,
  updateTicketStatus,
  getTicketById,
  getTickets,
} = require("../controllers/ticketController");

const router = express.Router();

/**
 * ✅ Create Ticket (Customer) + Image Upload (optional)
 */
router.post(
  "/",
  protect,
  authorizeRoles("customer"),
  upload.single("image"),
  createTicket
);

/**
 * ✅ List Tickets (Admin / Engineer / Customer)
 */
router.get(
  "/",
  protect,
  authorizeRoles("admin", "engineer", "customer"),
  getTickets
);

/**
 * ✅ Assign Ticket (Admin)
 */
router.patch(
  "/assign",
  protect,
  authorizeRoles("admin"),
  assignTicket
);

/**
 * ✅ Update Ticket Status
 */
router.patch("/:ticketId/status", protect, updateTicketStatus);

/**
 * ✅ Get Single Ticket
 */
router.get(
  "/:ticketId",
  protect,
  authorizeRoles("admin", "engineer", "customer"),
  getTicketById
);

module.exports = router;
