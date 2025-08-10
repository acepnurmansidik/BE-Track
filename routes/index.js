const express = require("express");
const router = express.Router();

const authRouter = require("../resource/app/router/auth.router");
const refparamRouter = require("../resource/app/router/reffParam.router");
const AuthorizeUserLogin = require("../resource/middleware/authentification");

router.use("/auth", authRouter);
router.use(AuthorizeUserLogin);
router.use("/ref-parameter", refparamRouter);

module.exports = router;
