const SysUploadFileSchema = require("../models/sys_uploadfile");
const responseAPI = require("../../utils/response");
const { methodConstant } = require("../../utils/constanta");

const controller = {};

controller.uploadFile = async (req, res, next) => {
  /*
    #swagger.security = [{
      "bearerAuth": []
    }]
  */
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
    const files = req.files;

    const data = [];
    for (fileImage of files) {
      const response = await SysUploadFileSchema.create({
        name: fileImage.path,
      });

      data.push({
        _id: response._id,
        name: response.name,
        originalname: fileImage.originalname,
        is_cover: response.is_cover,
      });
    }

    responseAPI.MethodResponse({
      res,
      method: methodConstant.POST,
      data,
    });
  } catch (err) {
    next(next);
  }
};

controller.uploadFileUpdate = async (req, res, next) => {
  /*
    #swagger.security = [{
      "bearerAuth": []
    }]
  */
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
    const files = req.files;
    const id = req.params.id;

    // delete all file with id
    await SysUploadFileSchema.deleteMany({ reff_id: id });

    //
    const data = [];
    for (fileImage of files) {
      const response = await SysUploadFileSchema.create({
        name: fileImage.path,
        reff_id: id,
      });

      data.push({
        _id: response._id,
        name: response.name,
        is_cover: response.is_cover,
      });
    }

    responseAPI.MethodResponse({
      res,
      method: methodConstant.POST,
      data,
    });
  } catch (err) {
    next(next);
  }
};

module.exports = controller;
