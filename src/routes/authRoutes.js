const express = require("express");
const { registerUser, loginUser,  forgotPassword ,resetPassword} = require("../controllers/authController");

const router = express.Router();

// ❌ NO protect here
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

module.exports = router;
