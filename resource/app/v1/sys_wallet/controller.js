const { methodConstant } = require("../../../utils/constanta");
const WalletSchema = require("../../models/sys_wallet");
const responseAPI = require("../../../utils/response");
const { NotFoundError } = require("../../../utils/errors");

const controller = {};

controller.fetchIndexByUserLogin = async (req, res, next) => {
  /*
    #swagger.security = [{
      "bearerAuth": []
    }]
  */
  /*
    #swagger.tags = ['BANK/WALLET']
    #swagger.summary = 'api for bank/wallet'
    #swagger.description = 'this api for bank/wallet payment for user when do transaction'
  */
  try {
    // get data from database
    const data = await WalletSchema.find({
      $or: [{ user_id: req.login.user_id }, { user_id: null }],
    })
      .select("va_number wallet_name amount")
      .sort({ createdAt: -1 })
      .lean();

    // send response
    responseAPI.MethodResponse({ res, method: methodConstant.GET, data });
  } catch (err) {
    next(err);
  }
};

controller.createNewWalletBy = async (req, res, next) => {
  /*
    #swagger.security = [{
      "bearerAuth": []
    }]
  */
  /*
    #swagger.tags = ['BANK/WALLET']
    #swagger.summary = 'api for bank/wallet'
    #swagger.description = 'this api for bank/wallet payment for user when do transaction'
    #swagger.parameters['obj'] = {
      in: 'body',
      description: 'Create role',
      schema: { $ref: '#/definitions/BodyWalletSchema' }
    }
  */
  try {
    // get payload form body
    const payload = req.body;

    // insert data user_id by user login
    payload.user_id = req.login.user_id;

    // create slug by wallet_name
    payload.slug = payload.wallet_name.toLowerCase().replace(" ", "-");

    // get data from database
    const result = await WalletSchema.create(payload);

    // send response to client
    responseAPI.MethodResponse({
      res,
      method: methodConstant.POST,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

controller.updateWallet = async (req, res, next) => {
  /*
    #swagger.security = [{
      "bearerAuth": []
    }]
  */
  /*
    #swagger.tags = ['BANK/WALLET']
    #swagger.summary = 'api for bank/wallet'
    #swagger.description = 'this api for bank/wallet payment for user when do transaction'
    #swagger.parameters['obj'] = {
      in: 'body',
      description: 'Create role',
      schema: { $ref: '#/definitions/BodyWalletSchema' }
    }
  */
  try {
    // get payload form body
    const payload = req.body;

    payload.slug = payload.wallet_name.toLowerCase().replace(" ", "-");

    // checked data from database
    const result = await WalletSchema.findOneAndUpdate(
      { _id: req.params.id },
      payload,
      {
        new: true,
      },
    );

    // send error not found when data empty
    if (!result)
      throw new NotFoundError(
        `Data with wallet name '${req.params.id} not found!'`,
      );

    // send response to client
    responseAPI.MethodResponse({
      res,
      method: methodConstant.PUT,
      data: null,
    });
  } catch (err) {
    next(err);
  }
};

controller.deleteWallet = async (req, res, next) => {
  /*
    #swagger.security = [{
      "bearerAuth": []
    }]
  */
  /*
    #swagger.tags = ['BANK/WALLET']
    #swagger.summary = 'api for bank/wallet'
    #swagger.description = 'this api for bank/wallet payment for user when do transaction'
  */
  try {
    // search used slug and user login
    const queryFilter = {};
    queryFilter.user_id = req.login.user_id;
    queryFilter.slug = req.params.slug;

    // checked data from database
    const result = await WalletSchema.findOneAndDelete({ _id: req.params.id });

    // send error not found when data empty
    if (!result)
      throw new NotFoundError(
        `Data with wallet name '${req.params.id} not found!'`,
      );

    // send response to client
    responseAPI.MethodResponse({
      res,
      method: methodConstant.DELETE,
      data: null,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = controller;
