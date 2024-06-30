const AuthSchema = require("./body/auth");

const GlobalSchema = {
  ...AuthSchema,
};

module.exports = GlobalSchema;
