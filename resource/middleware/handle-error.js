const { StatusCodes } = require("http-status-codes");
const { setupLogger } = require("../helper/global-func");

const errorHandlerMiddleware = (err, req, res, next) => {
  let customError = {
    // set default
    statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
    msg: err.message || "Something went wrong try again later",
  };
  // error validation dari mongoose
  if (err.name === "ValidationError") {
    customError.msg = Object.values(err.errors)
      .map((item) => item.message)
      .join(", ");
    customError.statusCode = 400;
  }

  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    customError.msg = Object.values(err.errors)
      .map((item) => item.message)
      .join(", ");
    customError.statusCode = 401;
  }

  if (err.code && err.code === 11000) {
    customError.msg = `Duplicate value entered for ${Object.keys(
      err.keyValue,
    )} field, please choose another value`;
    customError.statusCode = 400;
  }
  if (err.name === "CastError") {
    customError.msg = `No item found with id : ${err.value}`;
    customError.statusCode = 404;
  }

  if (["Validation error"].includes(customError.msg))
    customError.msg = "Record duplicate!";

  const options = {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  };
  const currentDateTime = new Intl.DateTimeFormat("id-ID", options)
    .format(new Date())
    .replaceAll("/", "-");

  setupLogger(currentDateTime.split(", ")[0], err);
  console.log(err);

  return res.status(StatusCodes.BAD_REQUEST).json({
    success: false,
    message: customError.msg,
    data: null,
  });
};

module.exports = errorHandlerMiddleware;
