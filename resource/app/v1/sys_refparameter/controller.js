const SysRefparamSchema = require("../../models/sys_refparam");
const responseAPI = require("../../../utils/response");
const { methodConstant } = require("../../../utils/constanta");

const controller = {};

controller.index = async (req, res, next) => {
  try {
    /*
    #swagger.tags = ['REF PARAMETER']
    #swagger.summary = 'ref parameter'
    #swagger.description = 'untuk referensi group'
    #swagger.parameters['type'] = { default: 'cashflow_type', description: 'Search by type' }
  */
    const query = req.query;
    const data = await SysRefparamSchema.find(query).select([
      "-createdAt",
      "-updatedAt",
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
    #swagger.tags = ['REF PARAMETER']
    #swagger.summary = 'ref parameter'
    #swagger.description = 'untuk referensi group'
    #swagger.parameters['obj'] = {
      in: 'body',
      description: 'Create role',
      schema: { $ref: '#/definitions/BodyRefParameterSchema' }
    }
  */
    const payload = req.body;
    payload.type = payload.type.toLowerCase().replace(" ", "_");
    payload.value = payload.value.toLowerCase();
    const data = await SysRefparamSchema.create(payload);

    responseAPI.MethodResponse({
      res,
      method: methodConstant.POST,
      data: payload,
    });
  } catch (err) {
    next(err);
  }
};

controller.update = async (req, res, next) => {
  try {
    /*
    #swagger.tags = ['REF PARAMETER']
    #swagger.summary = 'ref parameter'
    #swagger.description = 'untuk referensi group'
    #swagger.parameters['obj'] = {
      in: 'body',
      description: 'Create role',
      schema: { $ref: '#/definitions/BodyRefParameterSchema' }
    }
  */
    const payload = req.body;
    const _id = req.params.id;

    payload.type = payload.type.toLowerCase().replace(" ", "_");
    payload.value = payload.value.toLowerCase();
    const data = await SysRefparamSchema.findOneAndUpdate({ _id }, payload);

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
    #swagger.tags = ['REF PARAMETER']
    #swagger.summary = 'ref parameter'
    #swagger.description = 'untuk referensi group'
  */
    const _id = req.params.id;

    await SysRefparamSchema.findOneAndDelete({ _id });

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
