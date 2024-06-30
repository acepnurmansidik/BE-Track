const AuthUser = require("../models/auth");

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
      schema: { $ref: '#/definitions/BodyAuthSchema' }
    }
  */
    const payload = req.body;
    const result = await AuthUser.create(payload);

    res.status(201).json({ data: result });
  } catch (err) {
    next(err);
  }
};

module.exports = controller;
