const Authchema = require("./body/auth");
const FinancialLedgerSchema = require("./body/sys_financial_ledger");
const RefParameterSchema = require("./body/sys_refparameter");

const GlobalSchema = {
  ...Authchema.Register,
  ...Authchema.Login,
  ...Authchema.ForgotPassword,
  ...RefParameterSchema,
  ...FinancialLedgerSchema,
};

module.exports = GlobalSchema;
