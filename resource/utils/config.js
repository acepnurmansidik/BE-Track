const dotENV = require("dotenv");
const env = process.env.NODE_ENV || "local"; // default ke 'development'

switch (env) {
  case "production":
    dotENV.config({ path: ".env.production" });
    break;
  case "development":
    dotENV.config({ path: ".env.development" });
    break;
  default:
    dotENV.config({ path: ".env.local" });
    break;
}

const ENV = {
  urlDb: process.env.URL_MONGODB_DEV,
  saltEncrypt: process.env.SALT_ENCRYPT,
  portAccess: process.env.PORT,
  jwtId: process.env.JWT_ID,
  tokenExp: process.env.TOKEN_EXPIRED,
  secretKey: process.env.TOKEN_SECRET,
  tokenAlgorithm: process.env.TOKEN_ALGORITHM,
  filePath: process.env.FILE_PATH,
  puclicIP: process.env.SERVER_IP_ULTRA,
  urlUltra: `${process.env.URL_API}${process.env.SERVER_IP_ULTRA}:${process.env.PORT}/`,
};

module.exports = ENV;
