const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");

const app = express();

// import router categories
const indexRouter = require("./routes");

// membuat variabel v1
const v1 = "/api/v1";

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// gunakan categories router
app.use(v1, indexRouter);

module.exports = app;
