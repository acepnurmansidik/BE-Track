const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Fungsi untuk membuat folder jika belum ada
const ensureDirExistence = (filePath) => {
  const dirname = path.dirname(filePath);
  if (!fs.existsSync(filePath)) {
    console.log(`Folder does not exist, create folder: ${dirname}`);
    fs.mkdirSync(filePath, { recursive: true });
  }
};

// Fungsi untuk mendapatkan storage secara dinamis
const getStorage = (folder) => {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      const fileExtension = file.mimetype.split("/")[1];
      let pathDir = "uploads/";
      if (["jpg", "jpeg", "png"].includes(fileExtension)) {
        pathDir += "images";
      } else if (["doc", "docx", "xlsx", "pdf"].includes(fileExtension)) {
        pathDir += "doc";
      } else if (["csv"].includes(fileExtension)) {
        pathDir += "csv";
      }

      // Menentukan folder tujuan berdasarkan parameter folder
      const uploadDir = path.join(__dirname, `../../${pathDir}/${folder}`);

      // Debugging: log lokasi folder yang digunakan
      // console.log(`Upload destination folder: ${uploadDir}`);

      // Pastikan folder tujuan ada
      ensureDirExistence(uploadDir); // Membuat folder jika belum ada
      cb(null, uploadDir); // Folder tujuan upload
    },
    filename: (req, file, cb) => {
      cb(
        null,
        Date.now() +
          `${Math.random().toString(36).split(".")[1]}${
            Math.random().toString(36).split(".")[1]
          }.${file.mimetype.split("/")[1]}`,
      );
    },
  });
};

// Fungsi middleware yang menerima parameter folder
const uploadFilesMiddleware = (folder) => {
  const formatAllowed = "jpg jpeg png doc docx csv pdf";

  const upload = multer({
    storage: getStorage(folder),
    fileFilter: (req, file, cb) => {
      const fileExtension = file.mimetype.split("/")[1];
      // Filter file (hanya .jpg dan .png)
      if (formatAllowed.split(" ").includes(fileExtension)) {
        cb(null, true);
      } else {
        cb(
          new Error(
            `Unsupported file format only ${formatAllowed} files are allowed`,
          ),
          false,
        );
      }
    },
    limits: { fileSize: 15 * 1024 * 1024 }, // 15 Mb
  });

  return upload.fields([{ name: "proofs", maxCount: 5 }]);
};

module.exports = uploadFilesMiddleware;
