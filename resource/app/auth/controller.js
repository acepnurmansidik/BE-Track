const { saltEncrypt } = require("../../utils/config");
const AuthUser = require("../models/auth");
const bcrypt = require("bcrypt");
const responseAPI = require("../../utils/response");
const { BadRequestError, NotFoundError } = require("../../utils/errors");
const { methodConstant } = require("../../utils/constanta");

const controller = {};

controller.Register = async (req, res, next) => {
  try {
    /* 
    #swagger.tags = ['Master Role']
    #swagger.summary = 'role user'
    #swagger.description = 'every user has role for access'
    #swagger.parameters['obj'] = {
      in: 'body',
      description: 'Create role',
      schema: { $ref: '#/definitions/BodyAuthRegisterSchema' }
    }
  */
    const payload = req.body;

    // komparasikan dengna yang ada di database
    const isAvailable = await AuthUser.findOne({ email: payload.email });
    if (isAvailable) {
      throw new BadRequestError("Email has been register!");
    }

    // lakukan enkripsi pada password
    payload.password = await bcrypt.hash(
      payload.password,
      parseInt(saltEncrypt),
    );

    await AuthUser.create(payload);

    responseAPI.MethodResponse({
      res,
      method: methodConstant.POST,
      data: null,
    });
  } catch (err) {
    next(err);
  }
};

controller.Login = async (req, res, next) => {
  try {
    /*
    #swagger.tags = ['Master Role']
    #swagger.summary = 'role user'
    #swagger.description = 'every user has role for access'
    #swagger.parameters['obj'] = {
      in: 'body',
      description: 'Create role',
      schema: { $ref: '#/definitions/BodyAuthLoginSchema' }
    }
  */
    const { email, password } = req.body;
    // komparasikan data darai body dengan di databse
    const isAvailable = await AuthUser.findOne({ email });
    if (!isAvailable) {
      throw new NotFoundError("Email not register!");
    }

    const isMatch = await bcrypt.compare(password, isAvailable.password);
    if (!isMatch) {
      throw new BadRequestError("Please check your password!");
    }

    responseAPI.MethodResponse({
      res,
      method: methodConstant.GET,
      data: null,
    });
  } catch (err) {
    next(err);
  }
};

controller.recoveryPassword = async (req, res, next) => {
  /*
    #swagger.tags = ['Master Role']
    #swagger.summary = 'role user'
    #swagger.description = 'every user has role for access'
    #swagger.parameters['obj'] = {
      in: 'body',
      description: 'Create role',
      schema: { $ref: '#/definitions/BodyAuthForgotSchema' }
    }
  */
  try {
    const { email, password, confirmPassword } = req.body;

    const isAvailable = await AuthUser.findOne({ email });
    if (!isAvailable) {
      throw new BadRequestError("Email not found!");
    }

    if (password !== confirmPassword) {
      throw new BadRequestError("Please check your password!");
    }

    await AuthUser.findOneAndUpdate({ email }, { password });

    responseAPI.MethodResponse({ res, method: methodConstant.PUT, data: null });
  } catch (err) {
    next(err);
  }
};

module.exports = controller;
