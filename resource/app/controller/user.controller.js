const crudServices = require("../../helper/crudService");
const UsersModel = require("../models/users.model");

const controller = {};

controller.getUserProfile = async (req, res, next) => {
  /*
  #swagger.security = [{
    "bearerAuth": []
  }]
  */
  /*
    #swagger.tags = ['USER']
    #swagger.summary = 'user'
    #swagger.description = 'untuk referensi group'
  */
  try {
    const populateField = [
      {
        path: "auth_id",
        model: "AuthUser",
        select: "_id email",
      },
    ];
    const result = await crudServices.findOne(UsersModel, {
      query: { _id: req.login.user_id },
      populateField,
    });

    result.data._doc.email = result.data["auth_id"]["email"];

    delete result.data._doc.auth_id;

    res.status(200).json(result);
  } catch (error) {
    console.error(error, "Error on GET userprofile");
    res
      .status(400)
      .json({ success: false, message: error.message, data: null });
  }
};

module.exports = controller;
