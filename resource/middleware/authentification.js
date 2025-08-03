const AuthUser = require("../app/models/auth");
const SysUserSchema = require("../app/models/sys_users");
const globalService = require("../utils/global-func");
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
    const verifyData = await AuthUser.findOne({
      email: dataValid.email,
    }).select("_id username email");

    // send error not found, if data not register
    if (!verifyData) throw new NotFound("Data not register!");

    const userLogin = await SysUserSchema.findOne({
      auth_id: verifyData._id,
    }).select("_id");

    // impliment login user
    delete dataValid.iat;
    delete dataValid.exp;
    delete dataValid.jti;

    req.login = {
      ...verifyData._doc,
      _id: verifyData.id,
      user_id: userLogin._id,
    };
    // next to controller
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = AuthorizeUserLogin;
