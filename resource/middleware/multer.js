const multer = require("multer");

// IMAGES UPLOADED ==============================================================
const filterImages = (req, file, cb) => {
  if (
    [
      "jpg",
      "jpeg",
      "JPG",
      "JPEG",
      "png",
      "PNG",
      "doc",
      "docx",
      "xlsx",
      "pdf",
      "csv",
    ].includes(file.mimetype.split("/")[1])
  ) {
    cb(null, true);
  } else {
    //reject file
    cb({ message: "Unsupported file format please insert right!" }, false);
  }
};

const uploadFileConfig = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      let path = "uploads/";
      if (
        ["jpg", "jpeg", "JPG", "JPEG", "png", "PNG"].includes(
          file.mimetype.split("/")[1],
        )
      ) {
        path += "images";
      } else if (
        ["doc", "docx", "xlsx", "pdf"].includes(file.mimetype.split("/")[1])
      ) {
        path += "doc";
      } else if (["csv"].includes(file.mimetype.split("/")[1])) {
        path += "csv";
      }

      cb(null, path); // Sesuaikan dengan path direktori tujuan Anda
    },
    filename: (req, file, cb) => {
      cb(
        null,
        Date.now() +
          `${Math.random().toString(36).split(".")[1]}${
            Math.random().toString(36).split(".")[1]
          }${file.originalname.replace(/\s+/g, "-").replace(/[^\w-]+/g, "")}.${
            file.mimetype.split("/")[1]
          }`,
      );
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: filterImages,
});

module.exports = { uploadFileConfig };
