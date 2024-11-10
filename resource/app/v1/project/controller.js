const SysProjectSchema = require("../../models/sys_project");
const responseAPI = require("../../../utils/response");
const { methodConstant } = require("../../../utils/constanta");
const { NotFoundError } = require("../../../utils/errors");

const controller = {};

controller.index = async (req, res, next) => {
  /*
    #swagger.security = [{
      "bearerAuth": []
    }]
  */
  /*
    #swagger.tags = ['PROJECT SHOW CASE']
    #swagger.summary = 'project show case'
    #swagger.description = 'untuk referensi group'
    #swagger.parameters['limit'] = { default: '10', description: 'Search by type' }
    #swagger.parameters['page'] = { default: '1', description: 'Search by type' }
  */
  try {
    let { preserve, limit = 10, page = 1, alias, ...query } = req.query;
    let skip = (page - 1) * limit;

    const project = await SysProjectSchema.find();

    responseAPI.GetPaginationResponse({
      res,
      page,
      limit,
      data: project,
      total: project.length,
    });

    respoA;
  } catch (err) {
    next(err);
  }
};

controller.create = async (req, res, next) => {
  /*
    #swagger.security = [{
      "bearerAuth": []
    }]
  */
  /*
    #swagger.tags = ['PROJECT SHOW CASE']
    #swagger.summary = 'project show case'
    #swagger.description = 'untuk referensi group'
    #swagger.parameters['obj'] = {
      in: 'body',
      description: 'Create project',
      schema: { $ref: '#/definitions/BodyProjectResumeSchema' }
    }
  */
  try {
    const payload = req.body;

    const data = await SysProjectSchema.create(payload);

    responseAPI.MethodResponse({
      res,
      method: methodConstant.PUT,
      data: data,
    });
  } catch (err) {
    next(err);
  }
};

controller.update = async (req, res, next) => {
  /*
    #swagger.security = [{
      "bearerAuth": []
    }]
  */
  /*
    #swagger.tags = ['PROJECT SHOW CASE']
    #swagger.summary = 'project show case'
    #swagger.description = 'untuk referensi group'
    #swagger.parameters['obj'] = {
      in: 'body',
      description: 'Create project',
      schema: { $ref: '#/definitions/BodyProjectResumeSchema' }
    }
  */
  try {
    const payload = req.body;

    const isExist = await SysProjectSchema.findOne({ _id: req.params.id });
    if (!isExist) {
      throw new NotFoundError(`Data with id: ${req.params.id} not found!`);
    }

    const data = await SysProjectSchema.findOneAndUpdate(
      { _id: req.params.id },
      { ...payload },
      { new: true },
    );

    responseAPI.MethodResponse({
      res,
      method: methodConstant.POST,
      data: data,
    });

    respoA;
  } catch (err) {
    next(err);
  }
};

controller.delete = async (req, res, next) => {
  /*
    #swagger.security = [{
      "bearerAuth": []
    }]
  */
  /*
    #swagger.tags = ['PROJECT SHOW CASE']
    #swagger.summary = 'project show case'
    #swagger.description = 'untuk referensi group'
  */
  try {
    const isExist = await SysProjectSchema.findOne({ _id: req.params.id });
    if (!isExist) {
      throw new NotFoundError(`Data with id: ${req.params.id} not found!`);
    }

    await SysProjectSchema.findOneAndDelete(
      { _id: req.params.id },
      { new: true },
    );
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
