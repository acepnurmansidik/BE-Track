const AuthUser = require("../app/models/auth");
const globalService = require("../helper/global-func");
const { UnauthenticatedError } = require("../utils/errors");

const AuthorizeUserLogin = async (req, res, next) => {
  try {
    // get JWT token from header
    const authHeader =
      req.headers?.authorization?.split(" ")[
        req.headers.authorization.split(" ").length - 1
      ];

    // send error Token not found
    if (!authHeader || !req.headers.authorization)
      throw new UnauthenticatedError("Invalid credentials!");

    // verify JWT token
    const dataValid = await globalService.verifyJwtToken(authHeader, next);

    // check email is register on database
    const verifyData = await AuthUser.findOne({ email: dataValid.email });

    // send error not found, if data not register
    if (!verifyData) throw new NotFound("Data not register!");

    // impliment login user
    delete dataValid.iat;
    delete dataValid.exp;
    delete dataValid.jti;

    req.login = { ...dataValid };
    // next to controller
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = AuthorizeUserLogin;
