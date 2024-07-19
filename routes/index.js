const express = require("express");
const router = express.Router();

const authRouter = require("../resource/app/auth/router");
const refparamRouter = require("../resource/app/v1/sys_refparameter/router");
const financeLedgerRouter = require("../resource/app/v1/sys_financial_ledger/router");
const AuthorizeUserLogin = require("../resource/middleware/authentification");

router.use("/auth", authRouter);
router.use(AuthorizeUserLogin);
router.use("/ref-parameter", refparamRouter);
router.use("/trx", financeLedgerRouter);

module.exports = router;
