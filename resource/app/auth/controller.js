const { jwt } = require("../../utils/config");
const AuthUser = require("../models/auth");
const UserSchema = require("../models/users.model");
const bcrypt = require("bcrypt");
const globalFunc = require("../../utils/global-func");
const { BadRequestError, NotFoundError } = require("../../utils/errors");
const { methodConstant } = require("../../utils/constanta");
const globalService = require("../../helper/global-func");
const { default: mongoose } = require("mongoose");
const crudServices = require("../../helper/crudService");

const controller = {};

controller.Register = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
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
    const { token, ...payload } = req.body;

    // komparasikan dengna yang ada di database
    const isAvailable = await AuthUser.findOne({ email: payload.email });
    if (isAvailable) {
      throw new BadRequestError("Email has been register!");
    }

    // lakukan enkripsi pada password
    payload.password = await bcrypt.hash(
      payload.password,
      parseInt(jwt.saltEncrypt),
    );

    const auth = new AuthUser({ ...payload });
    await auth.save({ session });

    const user = new UserSchema({
      auth_id: auth._id,
      device_token: token,
      name: auth.username,
    });
    await user.save({ session });

    // Jika semua operasi berhasil, commit transaksi
    await session.commitTransaction();

    globalFunc.MethodResponse({
      res,
      method: methodConstant.POST,
      data: null,
    });
  } catch (err) {
    await session.abortTransaction();
    next(err);
  } finally {
    session.endSession();
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

    const isAvailable = await crudServices.findOne(AuthUser, {
      query: { email },
      selectField: "-createdAt",
    });

    if (!isAvailable.data) {
      throw new NotFoundError("Email not register!");
    }

    const isMatch = await bcrypt.compare(password, isAvailable.data.password);
    if (!isMatch) {
      throw new BadRequestError("Please check your password!");
    }

    const users = await crudServices.findOne(UserSchema, {
      auth_id: isAvailable.data._id,
      selectField: "-auth_id",
    });

    const token = globalService.generateJwtToken({
      email,
      name: isAvailable.data.username,
    });

    res.status(200).json({
      status: true,
      message: "Login success!",
      data: { ...users.data, token },
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
    const { email, password, confirm_password } = req.body;

    const isAvailable = await AuthUser.findOne({ email });

    if (!isAvailable) {
      throw new BadRequestError("Email not found!");
    }

    if (password !== confirm_password) {
      throw new BadRequestError("Please check your password!");
    }

    const result = await crudServices.update(AuthUser, {
      fieldSearch: { email },
      data: {
        password: await bcrypt.hash(password, parseInt(jwt.saltEncrypt)),
      },
    });

    const token = globalService.generateJwtToken({
      email,
      name: result.data.username,
    });

    res.status(200).json({
      status: true,
      message: "Login success!",
      data: {
        _id: result.data._id,
        name: result.data.username,
        email: result.data.email,
        token,
      },
    });
  } catch (err) {
    next(err);
  }
};

controller.uploadFile = async (req, res, next) => {
  /*
    #swagger.tags = ['UPLOAD IMAGES']
    #swagger.summary = 'this API for upload images'
    #swagger.description = 'untuk referensi group'
    #swagger.consumes = ['multipart/form-data']
    #swagger.parameters['proofs'] = {
      in: 'formData',
      type: 'array',
      required: true,
      description: 'Some description...',
      collectionFormat: 'multi',
      items: { type: 'file' }
    }
  */
  try {
    const fileResult = await globalService.uploadFiles(req.files.proofs);
    const _temp = fileResult.map((item) => {
      return { _id: item.id, path: item.path };
    });

    globalFunc.MethodResponse({
      res,
      method: methodConstant.POST,
      data: _temp,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = controller;
