const express = require("express");
const router = express.Router();
const protect = require("../middlewares/authMiddleware");
const { authorizeRoles } = require("../middlewares/roleMiddleware");

const amcUpload = require("../middlewares/amcUploadMiddleware");

const {
  createAMC,
  getAllAMCs,
  getAMCById,
  updateAMC,
  getMyAMCs,
  uploadAmcDocument,
  softDeleteAMC,
  downloadAmcDocument,
  downloadMyAmcDocument,
  downloadAmcDocumentAdmin,
} = require("../controllers/amcController");

// ✅ CUSTOMER
router.get("/my", protect, authorizeRoles("customer"), getMyAMCs);

// ✅ ADMIN
router.get("/", protect, authorizeRoles("admin"), getAllAMCs);
router.get("/:amcId", protect, authorizeRoles("admin"), getAMCById);
router.post("/", protect, authorizeRoles("admin"), createAMC);
router.patch("/:amcId", protect, authorizeRoles("admin"), updateAMC);
router.get("/:amcId/download-document", protect, authorizeRoles("admin"), downloadAmcDocument);
router.get(
  "/:amcId/download-my-document",
  protect,
  authorizeRoles("customer"),
  downloadAmcDocument
);

// ✅ Upload AMC document (Admin)
router.patch(
  "/:amcId/upload-document",
  protect,
  authorizeRoles("admin"),
  amcUpload.single("document"),
  uploadAmcDocument
);

router.get(
  "/:amcId/download-my-document",
  protect,
  authorizeRoles("customer"),
  downloadMyAmcDocument
);



// ✅ Soft delete AMC (Admin)
router.delete("/:amcId", protect, authorizeRoles("admin"), softDeleteAMC);

module.exports = router;
