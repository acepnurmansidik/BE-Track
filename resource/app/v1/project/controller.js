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

    const [totalData, project] = await Promise.all([
      await SysProjectSchema.find().countDocuments().lean(),
      await SysProjectSchema.find()
        .populate("categories")
        .populate("images")
        .populate("stacks")
        .populate("status_id")
        .lean(),
    ]);

    responseAPI.GetPaginationResponse({
      res,
      page,
      limit,
      data: project,
      total: totalData ?? 1,
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
    await data.save({ session });

    // Memperbarui gambar
    if (payload?.images) {
      for (const img of payload.images) {
        await sys_uploadfile.findOneAndUpdate(
          { _id: img._id },
          { is_cover: false, is_active: true },
          { session },
        );
      }
    }

    // Commit transaksi
    await session.commitTransaction();
    // Mengembalikan respons yang sesuai
    responseAPI.MethodResponse({
      res,
      method: methodConstant.POST,
      data: null, // Mengembalikan data yang disimpan
    });
  } catch (err) {
    // Abort transaksi jika terjadi kesalahan
    await session.abortTransaction();
    next(err); // Mengirimkan kesalahan ke middleware error handling
  } finally {
    await session.endSession();
  }
};

controller.findById = async (req, res, next) => {
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
    const _id = req.params.id;

    // cek project berdaasarkan id
    const result = await SysProjectSchema.findOne({ _id })
      .populate("categories")
      .populate("images")
      .populate("stacks")
      .populate("status_id")
      .select("-createdAt -updated")
      .lean();
    if (!result) {
      throw new NotFoundError(`Data with id: ${_id} not found!`);
    }

    responseAPI.MethodResponse({
      res,
      method: methodConstant.POST,
      data: result,
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

    // get _id images upload for bulk update
    const _tempImages = [];
    if (payload?.images) {
      for (let imgItem of payload?.images) {
        _tempImages.push(imgItem._id);
      }
    }

    await Promise.all([
      // jika datanya ada, lakukan update
      await SysProjectSchema.findOneAndUpdate(
        { _id },
        { ...payload },
        { new: true, session },
      ),

      // setl all image to unlink
      await sys_uploadfile.updateMany(
        { _id: { $in: isExist.images } },
        { is_active: false, is_cover: false },
        { session },
      ),

      // lalu perbarui gambar yang dipakai
      await sys_uploadfile.updateMany(
        { _id: { $in: _tempImages } },
        { is_active: true, is_cover: false },
        { session },
      ),
    ]);

    // akhiri transaction dan session
    await session.commitTransaction();
    responseAPI.MethodResponse({
      res,
      method: methodConstant.POST,
      data: null,
    });
  } catch (err) {
    await session.abortTransaction();
    next(err);
  } finally {
    session.endSession();
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

    await Promise.all([
      // hapus data projectnya
      await SysProjectSchema.findOneAndDelete({ _id }, { new: true, session }),

      // lalu hapus juga data filesnya
      await sys_uploadfile.updateMany(
        { _id: { $in: isExist.images } },
        { is_active: false },
        { session },
      ),
    ]);

    // akhiri transaction dan session nya
    await session.commitTransaction();
    responseAPI.MethodResponse({
      res,
      method: methodConstant.DELETE,
      data: null,
    });
  } catch (err) {
    await session.abortTransaction();
    next(err);
  } finally {
    await session.endSession();
  }
};

module.exports = controller;
