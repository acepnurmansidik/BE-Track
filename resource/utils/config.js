const dotENV = require("dotenv");
dotENV.config();

const ENV = {
  urlDb: process.env.URL_MONGODB_DEV,
};

module.exports = ENV;
