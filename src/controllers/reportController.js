const Ticket = require("../models/Ticket");
const User = require("../models/User");

exports.getEngineerWorkloadReport = async (req, res) => {
  try {
    const engineers = await User.find({ role: "engineer" }).select(
      "_id name email"
    );

    const report = await Promise.all(
      engineers.map(async (engineer) => {
        const stats = await Ticket.aggregate([
          {
            $match: {
              assignedTo: engineer._id,
            },
          },
          {
            $group: {
              _id: "$status",
              count: { $sum: 1 },
            },
          },
        ]);

        const summary = {
          open: 0,
          "in-progress": 0,
          resolved: 0,
          closed: 0,
        };

        stats.forEach((s) => {
          summary[s._id] = s.count;
        });

        return {
          engineerId: engineer._id,
          name: engineer.name || engineer.email,
          total:
            summary.open +
            summary["in-progress"] +
            summary.resolved +
            summary.closed,
          ...summary,
        };
      })
    );

    res.status(200).json(report);
  } catch (error) {
    console.error("ENGINEER REPORT ERROR:", error.message);
    res.status(500).json({ message: error.message });
  }
};
