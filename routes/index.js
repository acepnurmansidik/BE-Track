const express = require("express");
const router = express.Router();

const authRouter = require("../resource/app/auth/router");
const profileRouter = require("../resource/app/v1/sys_profile/router");
const refparamRouter = require("../resource/app/v1/sys_refparameter/router");
const showCaseRouter = require("../resource/app/v1/project/router");
const financeLedgerRouter = require("../resource/app/v1/sys_financial_ledger/router");
const UploadImagesRouter = require("../resource/app/uploadfile/router");
const WalletRouter = require("../resource/app/v1/sys_wallet/router");
const LoanRouter = require("../resource/app/v1/fnc_loan/router");
const AuthorizeUserLogin = require("../resource/middleware/authentification");

router.use("/auth", authRouter);
router.use("/upload", UploadImagesRouter);
router.use("/show-case", showCaseRouter);
router.use("/ref-parameter", refparamRouter);
router.use(AuthorizeUserLogin);
router.use("/loan", LoanRouter);
router.use("/trx", financeLedgerRouter);
router.use("/profile", profileRouter);
router.use("/wallet", WalletRouter);

module.exports = router;
