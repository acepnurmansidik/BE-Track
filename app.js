const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const cors = require("cors");

// Swagger
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger-output.json"); //

const app = express();

// import router categories
const indexRouter = require("./routes");
const notFoundMiddleware = require("./resource/middleware/not-found");
const handleErrorMiddleware = require("./resource/middleware/handle-error");

// membuat variabel v1
const v1 = "/api/v1";

app.use(cors());
app.use(logger("dev"));
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
