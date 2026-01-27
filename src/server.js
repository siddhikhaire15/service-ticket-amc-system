
require("dotenv").config();
const express = require("express");
const app = require("./app");
const connectDB = require("./config/db");
connectDB();
const PORT = process.env.PORT || 5000;

app.use("/api/reports", require("./routes/reportRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
