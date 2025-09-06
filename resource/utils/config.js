const dotENV = require("dotenv");
dotENV.config();

const ENV = {
  urlDb: process.env.URL_MONGODB,
  jwt: {
    tokenExp: process.env.TOKEN_EXPIRED,
    secretKey: process.env.TOKEN_SECRET,
    tokenAlgorithm: process.env.TOKEN_ALGORITHM,
    saltEncrypt: process.env.SALT_ENCRYPT,
    jwtId: process.env.JWT_ID,
  },
  server: {
    portAccess: process.env.PORT,
    publicServer: process.env.PUBLIC_SERVER,
    nodeEnv: process.env.NODE_ENV,
    versionApp: process.env.VERSION_APP,
  },
  smtpConfig: {
    host: process.env.HOST_EMAIl,
    port: process.env.PORT_EMAIL,
    senderEmail: process.env.SOURCE_EMAIL,
    password: process.env.PASSWORD_EMAIL,
    secure: process.env.SECURE_EMAIL,
  },
};

module.exports = ENV;
