const Authchema = require("./body/auth");
const FinancialLedgerSchema = require("./body/sys_financial_ledger");
const RefParameterSchema = require("./body/sys_refparameter");
const ProfileSchema = require("./body/sys_profile");
const ProjectResumeSchema = require("./body/sys_project");
const UploadFileSchema = require("./body/sys_uploadfile");

const GlobalSchema = {
  ...Authchema.Register,
  ...Authchema.Login,
  ...Authchema.ForgotPassword,
  ...RefParameterSchema,
  ...FinancialLedgerSchema,
  ...ProfileSchema,
  ...ProjectResumeSchema,
  ...UploadFileSchema,
};

module.exports = GlobalSchema;
