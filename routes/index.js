const express = require("express");
const router = express.Router();

const AuthorizeUserLogin = require("../resource/middleware/authentification");
const authRouter = require("../resource/app/router/auth.router");
const refparamRouter = require("../resource/app/router/reffParam.router");
const transactionRouter = require("../resource/app/router/transactions.router");
const ewalletRouter = require("../resource/app/router/ewalllet.router");
const userRouter = require("../resource/app/router/user.router");

router.use("/auth", authRouter);
router.use("/ref-parameter", refparamRouter);
router.use(AuthorizeUserLogin);
router.use("/transaction", transactionRouter);
router.use("/wallet", ewalletRouter);
router.use("/user", userRouter);

module.exports = router;
