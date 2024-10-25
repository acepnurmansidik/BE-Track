const Authchema = require("./body/auth");
const FinancialLedgerSchema = require("./body/sys_financial_ledger");
const RefParameterSchema = require("./body/sys_refparameter");
const ProfileSchema = require("./body/sys_profile");

const GlobalSchema = {
  ...Authchema.Register,
  ...Authchema.Login,
  ...Authchema.ForgotPassword,
  ...RefParameterSchema,
  ...FinancialLedgerSchema,
  ...ProfileSchema,
};

module.exports = GlobalSchema;
