const Authchema = require("./body/auth");
const FinancialLedgerSchema = require("./body/sys_financial_ledger");
const RefParameterSchema = require("./body/sys_refparameter");
const ProfileSchema = require("./body/sys_profile");
const ProjectResumeSchema = require("./body/sys_project");
const UploadFileSchema = require("./body/sys_uploadfile");
const BillRunningSchema = require("./body/sys_bill_running");
const WalletSchema = require("./body/sys_wallet");
const LoadnSchema = require("./body/fnc_loan");

const GlobalSchema = {
  ...Authchema.Register,
  ...Authchema.Login,
  ...Authchema.ForgotPassword,
  ...RefParameterSchema,
  ...FinancialLedgerSchema,
  ...ProfileSchema,
  ...ProjectResumeSchema,
  ...UploadFileSchema,
  ...BillRunningSchema,
  ...WalletSchema,
  ...LoadnSchema,
};

module.exports = GlobalSchema;
