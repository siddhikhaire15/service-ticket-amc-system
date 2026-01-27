const express = require("express");
const protect = require("../middlewares/authMiddleware");
const { authorizeRoles } = require("../middlewares/roleMiddleware");
const {
  getEngineerWorkloadReport,
} = require("../controllers/reportController");

const router = express.Router();

router.get(
  "/engineer-workload",
  protect,
  authorizeRoles("admin"),
  getEngineerWorkloadReport
);

module.exports = router;
