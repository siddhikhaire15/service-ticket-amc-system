const express = require("express");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/authRoutes");
const ticketRoutes = require("./routes/ticketRoutes");
const amcRoutes = require("./routes/amcRoutes");
const serviceLogRoutes = require("./routes/serviceLogRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// ✅ FIXED STATIC FILE SERVING
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.use("/api/service-logs", serviceLogRoutes);
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/amc", amcRoutes);

module.exports = app;
