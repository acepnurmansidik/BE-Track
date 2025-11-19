const Authchema = require("./auth.schema");
const RefParameterSchema = require("./reffParameter.schema");
const EWalletSchema = require("./ewallet.schema");
const TransactionSchema = require("./transaction.schema");
const LoanSchema = require("./loan.schema");

const GlobalSchema = {
  ...Authchema.Register,
  ...Authchema.Login,
  ...Authchema.ForgotPassword,
  ...RefParameterSchema,
  ...EWalletSchema,
  ...TransactionSchema,
  ...LoanSchema,
};

module.exports = GlobalSchema;
