const Authchema = require("./body/auth");
const RefParameterSchema = require("./body/sys_refparameter");

const GlobalSchema = {
  ...Authchema.Register,
  ...Authchema.Login,
  ...Authchema.ForgotPassword,
  ...RefParameterSchema,
};

module.exports = GlobalSchema;
