const jwt = require("jsonwebtoken");
const {
  secretKey,
  tokenAlgorithm,
  jwtId,
  tokenExp,
} = require("../utils/config");

const globalService = {};

/**
 * -----------------------------------------------
 * | JSON WEB TOKEN
 * -----------------------------------------------
 * | if you wanna privacy data exchange
 * | this function can be help you
 * | and your privay keep safe using JWT
 * |
 */
globalService.generateJwtToken = ({ ...payload }) => {
  const jwtSignOptions = {
    algorithm: tokenAlgorithm,
    expiresIn: tokenExp,
    jwtid: jwtId,
  };

  return jwt.sign(payload, secretKey, jwtSignOptions);
};

module.exports = globalService;
