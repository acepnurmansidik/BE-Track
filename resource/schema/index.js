const Authchema = require("./body/auth");

const GlobalSchema = {
  ...Authchema.Register,
  ...Authchema.Login,
  ...Authchema.ForgotPassword,
};

module.exports = GlobalSchema;
