const AuthUser = require("../models/auth");

const controller = {};

controller.Register = async (req, res, next) => {
  try {
    const payload = req.body;
    const result = await AuthUser.create(payload);

    res.status(201).json({ data: result });
  } catch (err) {
    next(err);
  }
};

module.exports = controller;
