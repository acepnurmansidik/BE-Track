const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const fs = require("fs");

// Swagger
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger-output.json");

const app = express();
const memory = require("process").memoryUsage();

// Menentukan direktori untuk file gambar
const imagesDirectory = path.join(__dirname, "uploads", "images");
const imagesDoc = path.join(__dirname, "uploads", "doc");
const imagesCSV = path.join(__dirname, "uploads", "csv");

// Menggunakan middleware express.static untuk menyajikan file statis
app.use("/uploads/images", express.static(imagesDirectory));
app.use("/uploads/doc", express.static(imagesDoc));
app.use("/uploads/csv", express.static(imagesCSV));

// import router categories
const indexRouter = require("./routes");
const notFoundMiddleware = require("./resource/middleware/not-found");
const handleErrorMiddleware = require("./resource/middleware/handle-error");
const { setupLogger } = require("./resource/helper/global-func");

// membuat variabel v1
const v1 = "/api/v1";

// Middleware untuk logging dengan waktu yang diperbarui
app.use(cors());
app.use((req, res, next) => {
  const options = {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  };

  const currentDateTime = new Intl.DateTimeFormat("id-ID", options)
    .format(new Date())
    .replaceAll("/", "-");

  // Store the start time for response time calculation
  const start = Date.now();

  const memoryUsage = `[MEM: ${`${(memory.rss / 1024 / 1024).toFixed(2)}MB`}]`;
  let logFormat = `[${currentDateTime}]::${memoryUsage}:: ${req.method}:${res.statusCode} :: ${req.url}`;
  res.on("finish", () => {
    (memory.rss / 1024 / 1024).toFixed(2);
    logFormat = logFormat + ` - ${Date.now() - start} ms`;
    setupLogger(currentDateTime.split(", ")[0], logFormat);
    console.log(logFormat);
  });

  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// gunakan categories router
app.use(v1, indexRouter);

// middleware
app.use(notFoundMiddleware);
app.use(handleErrorMiddleware);

module.exports = app;
