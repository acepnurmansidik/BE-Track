const dotENV = require("dotenv");
dotENV.config();

const ENV = {
  urlDb: process.env.URL_MONGODB_DEV,
  jwt: {
    tokenExp: process.env.TOKEN_EXPIRED,
    secretKey: process.env.TOKEN_SECRET,
    tokenAlgorithm: process.env.TOKEN_ALGORITHM,
    saltEncrypt: process.env.SALT_ENCRYPT,
    jwtId: process.env.JWT_ID,
  },
  server: {
    portAccess: process.env.PORT,
    nodeEnv: process.env.NODE_ENV,
  },
};

module.exports = ENV;
