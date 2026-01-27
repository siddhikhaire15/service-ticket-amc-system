const User = require("../models/User");
const bcrypt = require("bcryptjs");
// ✅ GET /api/users/me
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    return res.status(200).json({ user });
  } catch (err) {
    console.error("GET ME ERROR:", err.message);
    return res.status(500).json({ message: "Server error" });
  }
};

// ✅ PATCH /api/users/me
exports.updateMe = async (req, res) => {
  try {
    const { name } = req.body;

    // ✅ only allow updating name (safe)
    const updates = {};
    if (name !== undefined) updates.name = String(name).trim();

    const user = await User.findByIdAndUpdate(req.user.id, updates, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });

    return res.status(200).json({
      message: "Profile updated successfully",
      user,
    });
  } catch (err) {
    console.error("UPDATE ME ERROR:", err.message);
    return res.status(500).json({ message: "Server error" });
  }
};



// ✅ PATCH /api/users/change-password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: "currentPassword and newPassword are required",
      });
    }

    if (String(newPassword).length < 6) {
      return res.status(400).json({
        message: "New password must be at least 6 characters",
      });
    }

    const user = await User.findById(req.user.id).select("+password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const ismatch = await bcrypt.compare(currentPassword, user.password);
    if (!ismatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    await user.save();

    return res.status(200).json({
      message: "Password updated successfully",
    });
  } catch (err) {
    console.error("CHANGE PASSWORD ERROR:", err.message);
    return res.status(500).json({ message: "Failed to change password" });
  }
};

// ✅ GET /api/users/engineers (Admin only)
exports.getEngineers = async (req, res) => {
  try {
    const engineers = await User.find({ role: "engineer" }).select(
      "_id name email role status"
    );

    return res.status(200).json({ engineers });
  } catch (err) {
    console.error("GET ENGINEERS ERROR:", err.message);
    return res.status(500).json({ message: "Failed to fetch engineers" });
  }
};
