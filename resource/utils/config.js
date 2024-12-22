const dotENV = require("dotenv");
const env = process.env.NODE_ENV || "development"; // default ke 'development'

if (env === "production") {
  dotENV.config({ path: ".env.production" });
} else {
  dotENV.config({ path: ".env.development" });
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
};

module.exports = ENV;
