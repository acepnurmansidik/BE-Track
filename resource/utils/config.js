const dotENV = require("dotenv");
dotENV.config();

const ENV = {
  urlDb: process.env.URL_MONGODB_DEV,
  saltEncrypt: process.env.SALT_ENCRYPT,
  portAccess: process.env.PORT,
};

module.exports = ENV;
