const crudServices = require("../../helper/crudService");
const ReffParamModel = require("../models/reffParam.model");
const WalletModel = require("../models/ewallet.model");

const controller = {};

controller.indexAllWallet = async (req, res, next) => {
  const { limit, page, search } = req.query;
  const query = { is_delete: false, user_id: req.login.user_id };
  const selectField = "-slug -user_id";
  const skip = (Number(page) - 1) * limit; // skip the number of documents to be skipped
  const arrFilter = [];
  if (search) {
    arrFilter.push({ wallet_name: { $regex: search, $options: "i" } });
    arrFilter.push({ va_number: { $regex: search, $options: "i" } });
  }
  if (arrFilter.length) query["$or"] = arrFilter;
  /*
  #swagger.security = [{
    "bearerAuth": []
  }]
  */
  /*
    #swagger.tags = ['EWALLET']
    #swagger.summary = 'Get e-wallet'
    #swagger.description = 'Get e-wallet'
    #swagger.parameters['search'] = { default: '', description: 'Search by type wallet name, va number' }
    #swagger.parameters['limit'] = { default: 10, description: 'limit' }
    #swagger.parameters['page'] = { default: 1, description: 'page' }
  */
  const populateField = [
    { path: "currency_id", select: "_id value description" },
  ];
  try {
    const page_size = await WalletModel.countDocuments(query);
    const result = await crudServices.findAllPagination(WalletModel, {
      query,
      populateField,
      skip,
      selectField,
      limit,
    });

    res.status(200).json({ ...result, page_size, current_page: Number(page) });
  } catch (error) {
    console.log(error);
    res.status(400).json({ status: false, message: error.message, data: null });
  }
};

controller.createWallet = async (req, res, next) => {
  /*
  #swagger.security = [{
    "bearerAuth": []
  }]
  */
  /*
    #swagger.tags = ['EWALLET']
    #swagger.summary = 'Create e-wallte'
    #swagger.description = 'Create e-wallte'
    #swagger.parameters['obj'] = {
      in: 'body',
      description: 'Create role',
      schema: { $ref: '#/definitions/BodyWalletSchema' }
    }
  */
  try {
    const currencyReff = await ReffParamModel.findOne({
      _id: req.body.currency_id,
    });

    if (!currencyReff) {
      throw new Error("Data not found!");
    }

    const result = await crudServices.create(WalletModel, {
      data: {
        ...req.body,
        user_id: req.login.user_id.toString(),
      },
    });
    res.status(200).json(result);
  } catch (error) {
    console.log(error);
    res.status(400).json({ status: false, message: error.message, data: null });
  }
};

controller.updateWallet = async (req, res, next) => {
  const data = req.body;
  /*
  #swagger.security = [{
    "bearerAuth": []
  }]
  */
  /*
    #swagger.tags = ['EWALLET']
    #swagger.summary = 'Create e-wallte'
    #swagger.description = 'Create e-wallte'
    #swagger.parameters['obj'] = {
      in: 'body',
      description: 'Create role',
      schema: { $ref: '#/definitions/BodyWalletSchema' }
    }
  */
  try {
    const result = await crudServices.update(WalletModel, {
      id: req.params.id,
      data,
    });
    res.status(200).json(result);
  } catch (error) {
    console.log(error);
    res.status(400).json({ status: false, message: error.message, data: null });
  }
};

controller.deleteWallet = async (req, res, next) => {
  /*
  #swagger.security = [{
    "bearerAuth": []
  }]
  */
  /*
    #swagger.tags = ['EWALLET']
    #swagger.summary = 'Create e-wallte'
    #swagger.description = 'Create e-wallte'
  */
  try {
    const result = await crudServices.delete(WalletModel, {
      id: req.params.id,
    });
    res.status(200).json(result);
  } catch (error) {
    console.log(error);
    res.status(400).json({ status: false, message: error.message, data: null });
  }
};

module.exports = controller;
