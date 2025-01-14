const controller = require("../uploadfile/controller");
const { uploadFileConfig } = require("../../middleware/multer");

const router = require("express").Router();

// UPLOADED IMAGE FILE ============================================
router.post(
  "/img",
  uploadFileConfig.array("proofs", 10),
  controller.uploadFile,
);
router.put(
  "/img/:id",
  uploadFileConfig.array("proofs", 10),
  controller.uploadFileUpdate,
);

// UPLOADED DOCUMENT FILE ==========================================
router.post(
  "/doc",
  uploadFileConfig.array("proofs", 10),
  controller.uploadFile,
);
router.put(
  "/doc/:id",
  uploadFileConfig.array("proofs", 10),
  controller.uploadFileUpdate,
);

module.exports = router;
