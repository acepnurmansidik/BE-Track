const jwtToken = require("jsonwebtoken");
const { jwt, server } = require("../utils/config");
const ImageSchema = require("../app/models/image.model");
const { default: mongoose } = require("mongoose");
const path = require("path");
const fs = require("fs");
const { UnauthenticatedError } = require("../utils/errors");
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

// Create logger directory and dated file
globalService.setupLogger = (fileName, log) => {
  const loggerDir = path.join(__dirname, "../../logger");
  const dateFileName = `${fileName}.txt`;
  const filePath = path.join(loggerDir, dateFileName);

  try {
    if (server.nodeEnv === "production") {
      // Create directory if it doesn't exist
      if (!fs.existsSync(loggerDir)) {
        fs.mkdirSync(loggerDir, { recursive: true });
        console.log(`Created logger directory: ${loggerDir}`);

        // Create parent directory for dated file if needed
        const dateDir = path.dirname(filePath);
        if (!fs.existsSync(dateDir)) {
          fs.mkdirSync(dateDir, { recursive: true });
        }

        // Write initial data to file
        fs.writeFileSync(filePath, `${log}\n`, "utf8");
        console.log(`Created file with initial data: ${filePath}`);
      } else {
        // Check if file exists
        if (fs.existsSync(filePath)) {
          // Append data to existing file
          fs.appendFileSync(filePath, `${log}\n`, "utf8");
        } else {
          // Create parent directories if needed
          const dateDir = path.dirname(filePath);
          if (!fs.existsSync(dateDir)) {
            fs.mkdirSync(dateDir, { recursive: true });
          }

          // Create new file
          fs.writeFileSync(filePath, `${log}\n`, "utf8");
          console.log(`Created new file with initial data: ${filePath}`);
        }
      }
    }
  } catch (err) {
    console.error("Error in logger setup:", err);
    // You might want to throw the error here if this is critical setup
  }
};

module.exports = globalService;
