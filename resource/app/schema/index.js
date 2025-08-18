const Authchema = require("./auth.schema");
const RefParameterSchema = require("./reffParameter.schema");
const EWalletSchema = require("./ewallet.schema");
const TransactionSchema = require("./transaction.schema");

const GlobalSchema = {
  ...Authchema.Register,
  ...Authchema.Login,
  ...Authchema.ForgotPassword,
  ...RefParameterSchema,
  ...EWalletSchema,
  ...TransactionSchema,
};

module.exports = GlobalSchema;
