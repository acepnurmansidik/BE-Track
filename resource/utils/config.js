const dotENV = require("dotenv");
dotENV.config();

const ENV = {
  urlDb: process.env.URL_MONGODB_DEV,
  saltEncrypt: process.env.SALT_ENCRYPT,
  portAccess: process.env.PORT,
  jwtId: process.env.JWT_ID,
  tokenExp: process.env.TOKEN_EXPIRED,
  secretKey: process.env.TOKEN_SECRET,
  tokenAlgorithm: process.env.TOKEN_ALGORITHM,
  filePath: process.env.FILE_PATH,
};

module.exports = ENV;
