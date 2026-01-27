console.log("ROLE MIDDLEWARE FILE LOADED");

function authorizeRoles(...roles) {
  return (req, res, next) => {
    const userRole = String(req.user?.role || "").trim().toLowerCase();
    const allowedRoles = roles.map((r) => String(r).trim().toLowerCase());

    if (!req.user || !allowedRoles.includes(userRole)) {
      return res.status(403).json({
        message: "Access denied",
        userRole,
        allowedRoles,
      });
    }

    next();
  };
}

module.exports = {
  authorizeRoles,
};
