const { saltEncrypt } = require("../../utils/config");
const AuthUser = require("../models/auth");
const bcrypt = require("bcrypt");

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
    payload.password = await bcrypt.hash(payload.password, saltEncrypt);
    const result = await AuthUser.create(payload);

    res.status(201).json({ data: result });
  } catch (err) {
    next(err);
  }
};

module.exports = controller;
