const express = require("express");
const router = express.Router();

const protect = require("../middlewares/authMiddleware");
const { authorizeRoles } = require("../middlewares/roleMiddleware");

const {
  getMe,
  updateMe,
  changePassword,
  getEngineers, // ✅ NEW
} = require("../controllers/userController");

router.get("/me", protect, getMe);
router.patch("/me", protect, updateMe);
router.patch("/me/password", protect, changePassword);

// ✅ NEW: Admin can fetch engineers
router.get(
  "/engineers",
  protect,
  authorizeRoles("admin"),
  getEngineers
);

module.exports = router;
