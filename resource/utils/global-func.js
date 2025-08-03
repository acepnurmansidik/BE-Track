const jwt = require("jsonwebtoken");
const { secretKey, tokenAlgorithm, jwtId, tokenExp } = require("./config");
const { UnauthenticatedError } = require("./errors");

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
    algorithm: tokenAlgorithm,
    // expiresIn: tokenExp,
    jwtid: jwtId,
  };

  return jwt.sign(payload, secretKey, jwtSignOptions);
};

globalService.verifyJwtToken = async (token, next) => {
  try {
    // verify token
    const decode = await jwt.verify(token, secretKey, (err, decode) => {
      if (err) throw new UnauthenticatedError(err.message);
      if (!err) return decode;
    });
    return decode;
  } catch (err) {
    next(err);
  }
};

globalService.FindAll = async ({
  next,
  modelSchema,
  query = {},
  populateField = [],
  selectField = "",
}) => {
  try {
    let response = modelSchema
      .find({ ...query })
      .populate(populateField)
      .select(selectField)
      .sort({ createdAt: -1 })
      .lean();

    return response;
  } catch (err) {
    next(err);
  }
};

globalService.Aggregate = async ({ next, modelSchema, query }) => {
  try {
    let response = modelSchema.aggregate(query);

    return response;
  } catch (err) {
    next(err);
  }
};

module.exports = globalService;
