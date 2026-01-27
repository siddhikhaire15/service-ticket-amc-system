const AMC = require("../models/AMC");

// ✅ Helper: auto-status update (optional but pro)
function getAutoStatus(amc) {
  try {
    const now = new Date();
    if (amc?.status === "suspended") return "suspended";
    if (amc?.endDate && new Date(amc.endDate) < now) return "expired";
    return amc?.status || "active";
  } catch {
    return amc?.status || "active";
  }
}

/**
 * ✅ POST /api/amc  (Admin)
 */
exports.createAMC = async (req, res) => {
  try {
    const {
      customer,
      contractNumber,
      startDate,
      endDate,
      status,
      coveredServices,
      notes,
    } = req.body;

    if (!customer || !contractNumber || !startDate || !endDate) {
      return res.status(400).json({
        message: "customer, contractNumber, startDate, endDate are required",
      });
    }

    // ✅ Ensure unique contractNumber
    const existing = await AMC.findOne({ contractNumber });
    if (existing) {
      return res.status(400).json({
        message: "Contract number already exists",
      });
    }

    const amc = await AMC.create({
      customer,
      contractNumber,
      startDate,
      endDate,
      status: status || "active",
      coveredServices: Array.isArray(coveredServices) ? coveredServices : [],
      notes: notes || "",
    });

    return res.status(201).json({
      message: "AMC created successfully",
      amc,
    });
  } catch (err) {
    console.error("CREATE AMC ERROR:", err);
    return res.status(500).json({
      message: "Server error while creating AMC",
    });
  }
};


exports.uploadAmcDocument = async (req, res) => {
  try {
    const { amcId } = req.params;

    const amc = await AMC.findById(amcId);
    if (!amc) return res.status(404).json({ message: "AMC not found" });

    // ✅ multer attaches file here
    if (!req.file) {
      return res.status(400).json({ message: "Document file is required" });
    }

    // ✅ store url relative path
   const url = `/uploads/${req.file.filename}`;
amc.amcDocumentUrl = url;
await amc.save();

await Notification.create({
  user: amc.customer,
  message: "Your AMC has been uploaded/updated",
  type: "amc",
});



    return res.json({
      message: "AMC document uploaded successfully",
      amc,
    });
  } catch (error) {
    console.error("UPLOAD AMC DOC ERROR:", error);
    return res.status(500).json({ message: error.message || "Upload failed" });
  }
};



/**
 * ✅ GET /api/amc (Admin)
 */
exports.getAllAMCs = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || "1"), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || "10"), 1), 50);
    const skip = (page - 1) * limit;

    const { status, search } = req.query;

    const filter = { $or: [{ isDeleted: false }, { isDeleted: { $exists: false } }] };



    // ✅ status filter
    if (status && status !== "all") {
      filter.status = String(status).toLowerCase();
    }

    // ✅ search by contract number
    if (search && String(search).trim()) {
      const q = String(search).trim();
      filter.contractNumber = { $regex: q, $options: "i" };
    }

    const [amcs, total] = await Promise.all([
      AMC.find(filter)
        .populate("customer", "name email role")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      AMC.countDocuments(filter),
    ]);

    // ✅ auto-calc status if expired
    const mapped = amcs.map((a) => ({
      ...a.toObject(),
      status: getAutoStatus(a),
    }));

    return res.status(200).json({
      amcs: mapped,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("GET ALL AMC ERROR:", err);
    return res.status(500).json({
      message: "Server error while fetching AMCs",
    });
  }
};

/**
 * ✅ GET /api/amc/:amcId (Admin)
 */
exports.getAMCById = async (req, res) => {
  try {
    const { amcId } = req.params;

    const amc = await AMC.findById(amcId).populate(
      "customer",
      "name email role"
    );

    if (!amc) {
      return res.status(404).json({ message: "AMC not found" });
    }

    return res.status(200).json({
      amc: { ...amc.toObject(), status: getAutoStatus(amc) },
    });
  } catch (err) {
    console.error("GET AMC BY ID ERROR:", err);
    return res.status(500).json({
      message: "Server error while fetching AMC",
    });
  }
};

/**
 * ✅ PATCH /api/amc/:amcId (Admin)
 */
exports.updateAMC = async (req, res) => {
  try {
    const { amcId } = req.params;

    const amc = await AMC.findById(amcId);
    if (!amc) {
      return res.status(404).json({ message: "AMC not found" });
    }

    /* -------------------------------------------------
       ✅ STATUS CONTROL LOGIC (ADMIN – PREMIUM)
       ------------------------------------------------- */

    if (req.body.status) {
      const newStatus = req.body.status.toLowerCase();

      // ❌ Prevent re-activating expired AMC
      if (amc.status === "expired" && newStatus !== "expired") {
        return res.status(400).json({
          message: "Expired AMC cannot be reactivated",
        });
      }

      // ✅ Allow only valid transitions
      if (!["active", "suspended", "expired"].includes(newStatus)) {
        return res.status(400).json({
          message: "Invalid AMC status",
        });
      }

      amc.status = newStatus;
    }

    /* -------------------------------------------------
       ✅ OTHER SAFE FIELD UPDATES
       ------------------------------------------------- */

    const allowedFields = [
      "customer",
      "contractNumber",
      "startDate",
      "endDate",
      "coveredServices",
      "notes",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        amc[field] = req.body[field];
      }
    });

    await amc.save();

    const updated = await AMC.findById(amcId).populate(
      "customer",
      "name email role"
    );

    return res.status(200).json({
      message: "AMC updated successfully",
      amc: {
        ...updated.toObject(),
        status: getAutoStatus(updated), // ✅ auto-expire safety
      },
    });
  } catch (err) {
    console.error("UPDATE AMC ERROR:", err);
    return res.status(500).json({
      message: "Server error while updating AMC",
    });
  }
};


/**
 * ✅ GET /api/amc/my (Customer)
 * Customer can view ONLY their AMCs
 */
exports.getMyAMCs = async (req, res) => {
  try {
    const amcs = await AMC.find({ customer: req.user.id, isDeleted: false })
      .populate("customer", "name email role")
      .sort({ createdAt: -1 });

    const mapped = amcs.map((a) => ({
      ...a.toObject(),
      status: getAutoStatus(a),
    }));

    return res.status(200).json({
      amcs: mapped,
    });
  } catch (err) {
    console.error("GET MY AMCS ERROR:", err);
    return res.status(500).json({
      message: "Server error while fetching customer AMCs",
    });
  }
};

exports.softDeleteAMC = async (req, res) => {
  try {
    const { amcId } = req.params;

    const amc = await AMC.findById(amcId);
    if (!amc || amc.isDeleted) {
      return res.status(404).json({ message: "AMC not found" });
    }

    amc.isDeleted = true;
    amc.deletedAt = new Date();
    await amc.save();

    return res.status(200).json({
      message: "AMC deleted (soft) successfully",
    });
  } catch (err) {
    console.error("SOFT DELETE AMC ERROR:", err);
    return res.status(500).json({ message: "Server error while deleting AMC" });
  }
};

const path = require("path");
const fs = require("fs");

exports.downloadAmcDocument = async (req, res) => {
  try {
    const { amcId } = req.params;

    const amc = await AMC.findById(amcId);
    if (!amc) return res.status(404).json({ message: "AMC not found" });

    const docUrl = amc.amcDocumentUrl; // "/uploads/amc_xxx.pdf"
    if (!docUrl) return res.status(404).json({ message: "No document uploaded" });

    const filePath = path.join(__dirname, "..", docUrl); 
    // __dirname = controllers folder, ".." => src, "/uploads/..." => src/uploads

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "Document file missing on server" });
    }

    const cleanName = (amc.contractNumber || "AMC").replace(/\s+/g, "_");
    const downloadName = `${cleanName}.pdf`;

    return res.download(filePath, downloadName);
  } catch (err) {
    console.error("DOWNLOAD AMC DOC ERROR:", err);
    return res.status(500).json({ message: "Download failed" });
  }
};



exports.downloadMyAmcDocument = async (req, res) => {
  try {
    const { amcId } = req.params;

    const amc = await AMC.findById(amcId);
    if (!amc) return res.status(404).json({ message: "AMC not found" });

    // ✅ customer must own this AMC
    if (String(amc.customer) !== String(req.user.id)) {
      return res.status(403).json({ message: "Not allowed" });
    }

    if (!amc.amcDocumentUrl) {
      return res.status(404).json({ message: "No document uploaded" });
    }

    const filePath = path.join(__dirname, "..", amc.amcDocumentUrl); 
    // ex: /uploads/amc_xxx.pdf

    return res.download(filePath, `${amc.contractNumber || "AMC"}.pdf`);
  } catch (err) {
    console.error("DOWNLOAD MY AMC DOC ERROR:", err);
    return res.status(500).json({ message: "Download failed" });
  }
};

exports.downloadAmcDocumentAdmin = async (req, res) => {
  try {
    const { amcId } = req.params;

    const amc = await AMC.findById(amcId);
    if (!amc) return res.status(404).json({ message: "AMC not found" });

    if (!amc.amcDocumentUrl) {
      return res.status(404).json({ message: "No document uploaded" });
    }

    const filePath = path.join(__dirname, "..", amc.amcDocumentUrl);

    return res.download(filePath, `${amc.contractNumber || "AMC"}.pdf`);
  } catch (err) {
    console.error("ADMIN DOWNLOAD AMC DOC ERROR:", err);
    return res.status(500).json({ message: "Download failed" });
  }
};