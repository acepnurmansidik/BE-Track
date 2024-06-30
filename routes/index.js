const express = require("express");
const router = express.Router();

const authRouter = require("../resource/app/auth/router");

router.use("/auth", authRouter);

module.exports = router;
