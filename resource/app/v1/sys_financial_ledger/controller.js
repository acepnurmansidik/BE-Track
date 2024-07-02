const SysFinancialLedgerSchema = require("../../models/sys_financial_ledger");
const responseAPI = require("../../../utils/response");
const { methodConstant } = require("../../../utils/constanta");

const controller = {};

controller.index = async (req, res, next) => {
  try {
    /*
    #swagger.tags = ['FINANCE']
    #swagger.summary = 'ref parameter'
    #swagger.description = 'untuk referensi group'
  */
    const query = req.query;
    const data = await SysFinancialLedgerSchema.find(query).populate([
      { path: "type_id", select: "value" },
      { path: "category_id", select: "value" },
    ]);

    responseAPI.MethodResponse({
      res,
      method: methodConstant.GET,
      data,
    });
  } catch (err) {
    next(err);
  }
};

controller.create = async (req, res, next) => {
  try {
    /*
    #swagger.tags = ['FINANCE']
    #swagger.summary = 'ref parameter'
    #swagger.description = 'untuk referensi group'
    #swagger.parameters['obj'] = {
      in: 'body',
      description: 'Create role',
      schema: { $ref: '#/definitions/BodyFinancialLedgerSchema' }
    }
  */
    const payload = req.body;
    const data = await SysFinancialLedgerSchema.create(payload);

    responseAPI.MethodResponse({
      res,
      method: methodConstant.POST,
      data,
    });
  } catch (err) {
    next(err);
  }
};

controller.update = async (req, res, next) => {
  try {
    /*
    #swagger.tags = ['FINANCE']
    #swagger.summary = 'ref parameter'
    #swagger.description = 'untuk referensi group'
    #swagger.parameters['obj'] = {
      in: 'body',
      description: 'Create role',
      schema: { $ref: '#/definitions/BodyFinancialLedgerSchema' }
    }
  */
    const payload = req.body;
    const _id = req.params.id;

    const data = await SysFinancialLedgerSchema.findOneAndUpdate(
      { _id },
      payload,
    );

    responseAPI.MethodResponse({
      res,
      method: methodConstant.PUT,
      data,
    });
  } catch (err) {
    next();
  }
};

controller.delete = async (req, res, next) => {
  try {
    /*
    #swagger.tags = ['FINANCE']
    #swagger.summary = 'ref parameter'
    #swagger.description = 'untuk referensi group'
  */
    const _id = req.params.id;

    await SysFinancialLedgerSchema.findOneAndDelete({ _id });

    responseAPI.MethodResponse({
      res,
      method: methodConstant.DELETE,
      data: null,
    });
  } catch (err) {
    next();
  }
};

module.exports = controller;
