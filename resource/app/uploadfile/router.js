const controller = require("../uploadfile/controller");
const uploadConfig = require("../../middleware/multer");

const router = require("express").Router();

// UPLOADED IMAGE FILE ============================================
router.post(
  "/img",
  uploadConfig.uploadFileImagesConfig.array("proffs", 10),
  controller.uploadFile,
);
router.put(
  "/img/:id",
  uploadConfig.uploadFileImagesConfig.array("proffs", 10),
  controller.uploadFileUpdate,
);

// UPLOADED DOCUMENT FILE ==========================================
router.post(
  "/doc",
  uploadConfig.uploadFileDocumentConfig.array("proffs", 10),
  controller.uploadFile,
);
router.put(
  "/doc/:id",
  uploadConfig.uploadFileDocumentConfig.array("proffs", 10),
  controller.uploadFileUpdate,
);

module.exports = router;
