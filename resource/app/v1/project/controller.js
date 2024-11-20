const SysProjectSchema = require("../../models/sys_project");
const responseAPI = require("../../../utils/response");
const { methodConstant } = require("../../../utils/constanta");
const { NotFoundError } = require("../../../utils/errors");
const sys_uploadfile = require("../../models/sys_uploadfile");
const { default: mongoose } = require("mongoose");

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

    const project = await SysProjectSchema.find()
      .populate("categories")
      .populate("images")
      .populate("stacks");

    responseAPI.GetPaginationResponse({
      res,
      page,
      limit,
      data: project,
      total: project.length,
    });
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

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const payload = req.body;

    // Membuat instance baru dari SysProjectSchema
    const data = new SysProjectSchema(payload);
    // Menyimpan data dengan session
    const savedData = await data.save({ session });

    // // Memperbarui gambar
    // for (const img of payload.images) {
    //   await sys_uploadfile.findOneAndUpdate(
    //     { _id: img._id },
    //     { is_cover: img.is_cover, reff_id: savedData._id, is_active: true },
    //     { session },
    //   );
    // }

    // Commit transaksi
    await session.commitTransaction();
    session.endSession();
    // Mengembalikan respons yang sesuai
    responseAPI.MethodResponse({
      res,
      method: methodConstant.POST,
      data: null, // Mengembalikan data yang disimpan
    });
  } catch (err) {
    // Abort transaksi jika terjadi kesalahan
    await session.abortTransaction();
    session.endSession();
    next(err); // Mengirimkan kesalahan ke middleware error handling
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
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const payload = req.body;
    const _id = req.params.id;

    // cek project berdaasarkan id
    const isExist = await SysProjectSchema.findOne({ _id });
    if (!isExist) {
      throw new NotFoundError(`Data with id: ${_id} not found!`);
    }

    // jika datanya ada, lakukan update
    await SysProjectSchema.findOneAndUpdate(
      { _id },
      { ...payload },
      { new: true, session },
    );

    // update activenya menjadi false
    await sys_uploadfile.updateMany({ reff_id: _id }, { is_active: false });

    // lalu perbarui gambar yang dipakai
    for (const img of payload.images) {
      await sys_uploadfile.findOneAndUpdate(
        { _id: img._id },
        { is_cover: img.is_cover, reff_id: savedData._id, is_active: true },
        { session },
      );
    }

    // akhiri transaction dan session
    await session.commitTransaction();
    session.endSession();
    responseAPI.MethodResponse({
      res,
      method: methodConstant.POST,
      data: null,
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
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
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const _id = req.params.id;

    // cek apakah datany atersedia
    const isExist = await SysProjectSchema.findOne({ _id });
    if (!isExist) {
      throw new NotFoundError(`Data with id: ${_id} not found!`);
    }

    // hapus data projectnya
    await SysProjectSchema.findOneAndDelete({ _id }, { new: true, session });

    // lalu hapus juga data filesnya
    await sys_uploadfile.updateMany({ reff_id: _id }, { is_active: false });

    // akhiri transaction dan session nya
    await session.commitTransaction();
    session.endSession();
    responseAPI.MethodResponse({
      res,
      method: methodConstant.DELETE,
      data: null,
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    next(err);
  }
};

module.exports = controller;
