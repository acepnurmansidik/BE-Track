const multer = require("multer");
const path = require("path");
const responseAPI = require("../utils/response");
const { methodConstant } = require("../utils/constanta");
const ENV = require("../utils/config");

// IMAGES UPLOADED ==============================================================
const filterImages = (req, file, cb) => {
  if (["image/jpeg", "image/png", "image/jpg"].includes(file.mimetype)) {
    cb(null, true);
  } else {
    //reject file
    cb({ message: "Unsupported file format, only jpeg, jpg, png" }, false);
  }
};

const uploadFileImagesConfig = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, ENV.filePath + "images"); // Sesuaikan dengan path direktori tujuan Anda
    },
    filename: (req, file, cb) => {
      cb(
        null,
        Date.now() +
          `${Math.random().toString(36).split(".")[1]}${Math.floor(
            Math.random() * 9999999999,
          )}${file.originalname.replace(/\s+/g, "-")}`,
      );
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: filterImages,
});

// DOCUMENT UPLOADED ============================================================
const filterDocument = (req, file, cb) => {
  if (["image/jpeg", "image/png", "image/jpg"].includes(file.mimetype)) {
    cb(null, true);
  } else {
    //reject file
    cb({ message: "Unsupported file format, only jpeg, jpg, png" }, false);
  }
};

const uploadFileDocumentConfig = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, ENV.filePath + "doc"); // Sesuaikan dengan path direktori tujuan Anda
    },
    filename: (req, file, cb) => {
      cb(
        null,
        Date.now() +
          `${Math.random().toString(36).split(".")[1]}${Math.floor(
            Math.random() * 9999999999,
          )}${file.originalname.replace(/\s+/g, "-")}`,
      );
    },
  }),
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: filterDocument,
});

module.exports = { uploadFileImagesConfig, uploadFileDocumentConfig };
