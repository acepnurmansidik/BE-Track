const jwtToken = require("jsonwebtoken");
const { jwt } = require("../utils/config");
const ImageSchema = require("../app/models/image.model");
const { default: mongoose } = require("mongoose");

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
    algorithm: jwt.tokenAlgorithm,
    expiresIn: jwt.tokenExp,
    jwtid: jwt.jwtId,
  };

  return jwtToken.sign(payload, jwt.secretKey, jwtSignOptions);
};

globalService.verifyJwtToken = async (token, next) => {
  try {
    // verify token
    const decode = await jwtToken.verify(token, secretKey, (err, decode) => {
      if (err) throw new UnauthenticatedError(err.message);
      if (!err) return decode;
    });
    return decode;
  } catch (err) {
    next(err);
  }
};

globalService.generateUniqueCode = (customeCode) => {
  const tokenCode = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
  const token = [];
  for (let i = 0; i < 14; i++) {
    token.push(tokenCode[~~(Math.random() * tokenCode.length + 1)]);
  }

  return customeCode ?? "" + token.join(""); // Totalnya 14 digit
};

globalService.generateOTPCode = () => {
  const tokenCode = "1234567890";
  const token = [];
  for (let i = 0; i < 5; i++) {
    token.push(tokenCode[~~(Math.random() * tokenCode.length + 1)]);
  }

  return token.join(""); // Totalnya 14 digit
};

/**
 * -----------------------------------------------
 * | UPLOAD FILES
 * -----------------------------------------------
 * | if you wanna privacy data exchange
 */
globalService.uploadFiles = async (files, source_name) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const fileResult = await ImageSchema.create(files, { session });

    await session.commitTransaction();
    return fileResult;
  } catch (err) {
    await session.abortTransaction();
    throw new Error(err.message);
  } finally {
    await session.endSession();
  }
};

module.exports = globalService;
