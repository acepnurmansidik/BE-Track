const Authchema = require("./auth.schema");
const RefParameterSchema = require("./reffParameter.schema");

const GlobalSchema = {
  ...Authchema.Register,
  ...Authchema.Login,
  ...Authchema.ForgotPassword,
  ...RefParameterSchema,
};

module.exports = GlobalSchema;
