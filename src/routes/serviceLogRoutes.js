const express = require("express");
const router = express.Router();

const protect = require("../middlewares/authMiddleware");
const { authorizeRoles } = require("../middlewares/roleMiddleware");
const {
  addServiceLog,
  getServiceLogsByTicket,
} = require("../controllers/serviceLogController");

/**
 * Add service log (Engineer)
 */
router.post(
  "/",
  protect,
  authorizeRoles("engineer"),
  addServiceLog
);

/**
 * Get logs for a ticket
 */
router.get(
  "/:ticketId",
  protect,
  authorizeRoles("admin", "engineer", "customer"),
  getServiceLogsByTicket
);


module.exports = router;
