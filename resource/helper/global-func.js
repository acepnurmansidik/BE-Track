const jwtToken = require("jsonwebtoken");
const { jwt, server, smtpConfig } = require("../utils/config");
const nodemailer = require("nodemailer");
const ImageSchema = require("../app/models/image.model");
const { default: mongoose } = require("mongoose");
const path = require("path");
const fs = require("fs");
const { UnauthenticatedError } = require("../utils/errors");
const globalService = {};

const transporter = nodemailer.createTransport({
  host: smtpConfig.host,
  port: smtpConfig.port,
  secure: smtpConfig.secure, // true for 465, false for other ports
  auth: {
    user: smtpConfig.senderEmail,
    // password device
    pass: smtpConfig.password,
  },
});

/**
 * -----------------------------------------------
 * | EMAIL
 * -----------------------------------------------
 * | if you wanna send email to yours friends
 * | or another people this function can do it
 * | don't worry this very secret, just you and me
 * |
 */
globalService.sendEmail = async ({ template, payload, receive, subject }) => {
  // Get template email from html file
  const tempFile = fs.readFileSync(
    `resource/templates/${template}.html`,
    "utf-8",
  );

  // create instance email/config email
  let message = {
    from: ENV.emailSender,
    to: receive,
    subject,
    html: Mustache.render(tempFile, payload),
  };

  // send email
  return await transporter.sendMail(message);
};

/**
 * -----------------------------------------------
 * | GENERATE JWT TOKEN
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

/**
 * -----------------------------------------------
 * | VERIFY JWT TOKEN
 * -----------------------------------------------
 * | if you wanna privacy data exchange
 */
globalService.verifyJwtToken = async (token, next) => {
  try {
    // verify token
    const decode = await jwtToken.verify(
      token,
      jwt.secretKey,
      (err, decode) => {
        if (err) throw new UnauthenticatedError(err.message);
        if (!err) return decode;
      },
    );
    return decode;
  } catch (err) {
    next(err);
  }
};

/**
 * -----------------------------------------------
 * | CREATE UNIQUE
 * -----------------------------------------------
 * | if you wanna privacy data exchange
 * |
 */
globalService.generateUniqueCode = ({ customeCode, lengthCode = 10 }) => {
  const tokenCode = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
  const token = [];
  for (let i = 0; i < lengthCode; i++) {
    token.push(tokenCode[~~(Math.random() * tokenCode.length + 1)]);
  }

  return customeCode ?? "" + token.join(""); // Totalnya 14 digit
};

/**
 * -----------------------------------------------
 * | CREATE OTP CODE
 * -----------------------------------------------
 * | if you wanna privacy data exchange
 * |
 */
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

/**
 * -----------------------------------------------
 * | LOGGER
 * -----------------------------------------------
 * | Create logger directory and dated file
 */
globalService.setupLogger = (fileName, log) => {
  const loggerDir = path.join(__dirname, "../../logger");
  const dateFileName = `${fileName.split(" ")[0]}.txt`;
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
