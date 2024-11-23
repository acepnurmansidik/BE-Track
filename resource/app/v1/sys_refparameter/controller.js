const SysRefparamSchema = require("../../models/sys_refparam");
const SysUploadFileSchema = require("../../models/sys_uploadfile");
const responseAPI = require("../../../utils/response");
const { methodConstant } = require("../../../utils/constanta");
const BadRequest = require("../../../utils/errors/bad-request");
const { NotFoundError } = require("../../../utils/errors");
const { default: mongoose } = require("mongoose");
const sys_uploadfile = require("../../models/sys_uploadfile");

const controller = {};

controller.indexMobileResponse = async (req, res, next) => {
  /*
    #swagger.security = [{
      "bearerAuth": []
    }]
  */
  /*
    #swagger.tags = ['REF PARAMETER']
    #swagger.summary = 'ref parameter'
    #swagger.description = 'untuk referensi group'
    #swagger.parameters['type'] = { default: 'category', description: 'Search by type' }
    #swagger.parameters['preserve'] = { default: 'false', description: 'Search by type', type: 'boolean' }
  */
  try {
    const { preserve, ...query } = req.query;
    /*
    Penjelasan Pipeline Agregasi:
    1. $group:

    -> _id: { parentId: "$parentId", category: "$category" }: Mengelompokkan dokumen berdasarkan field parentId dan category.
    -> items: { $push: { _id: "$_id", name: "$name" } }: Menyimpan item-item dalam array dengan menyimpan name dan _id dari setiap dokumen.
    2. $lookup:

    -> from: 'parents': Nama koleksi dari parent yang akan di-lookup.
    -> localField: '_id.parentId': Field lokal yang akan di-lookup.
    -> foreignField: '_id': Field pada koleksi parent yang akan di-lookup.
    -> as: 'parent': Nama field hasil lookup.
    3. $unwind:

    -> path: "$parent": Mengurai array hasil lookup sehingga menjadi objek tunggal.
    -> preserveNullAndEmptyArrays: true: Memastikan dokumen tanpa parentId tetap muncul dalam hasil.
    4. $project:

    -> _id: 0: Menghapus field _id dari hasil akhir.
    -> parentId: "$_id.parentId": Menyimpan nilai parentId dari hasil $group ke dalam field parentId.
    -> parentName: "$parent.name": Menyimpan nama parent dari hasil lookup.
    -> category: "$_id.category": Menyimpan nilai category dari hasil $group ke dalam field category.
    -> items: 1: Menyimpan array items.
    5. $match:

    -> Menyaring dokumen yang memiliki nama (name) yang cocok dengan pola yang diberikan (nameFilter).
    -> $regex: nameFilter: Menggunakan ekspresi reguler untuk mencocokkan nama.
    -> $options: 'i': Opsi i digunakan untuk pencocokan tidak sensitif terhadap huruf besar/kecil.
    */
    const data = await SysRefparamSchema.aggregate([
      {
        $match: query,
      },
      {
        $sort: {
          key: 1,
        },
      },
      {
        $group: {
          _id: {
            parent_id: "$parent_id",
            type: "$type",
          },
          items: {
            $push: {
              _id: "$_id",
              key: "$key",
              name: "$value",
              description: "$description",
            },
          },
        },
      },
      {
        $lookup: {
          from: "sys_refparameters", // Nama koleksi parent sesuai nama didatabase
          localField: "_id.parent_id",
          foreignField: "_id",
          as: "parent",
        },
      },
      {
        $unwind: {
          path: "$parent",
          preserveNullAndEmptyArrays: preserve == "true" ? true : false, // Agar dokumen tanpa parentId tetap muncul
        },
      },
      {
        $project: {
          _id: 0,
          parent_id: "$_id.parent_id",
          type: "$_id.type",
          name: "$parent.value",
          items: 1,
        },
      },
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

controller.indexWebResponse = async (req, res, next) => {
  /*
    #swagger.security = [{
      "bearerAuth": []
    }]
  */
  /*
    #swagger.tags = ['REF PARAMETER']
    #swagger.summary = 'ref parameter'
    #swagger.description = 'untuk referensi group'
    #swagger.parameters['type'] = { default: '', description: 'Search by type' }
    #swagger.parameters['preserve'] = { default: 'false', description: 'Search by type', type: 'boolean' }
    #swagger.parameters['alias'] = { default: 'false', description: 'Search by type', type: 'boolean' }
    #swagger.parameters['limit'] = { default: '10', description: 'Search by type' }
    #swagger.parameters['page'] = { default: '1', description: 'Search by type' }
  */
  try {
    let { preserve, limit = 10, page = 1, alias, ...query } = req.query;
    let skip = (page - 1) * limit;

    const [totalData, dReffParam, dAliasReffParam] = await Promise.all([
      await SysRefparamSchema.find().countDocuments().lean(),
      await SysRefparamSchema.find(query)
        .populate("icon")
        .skip(skip)
        .limit(limit)
        .select("-createdAt -updatedAt")
        .lean(),
      await SysRefparamSchema.aggregate([
        { $match: query },
        {
          $group: {
            _id: { value: "$value", id: "$_id", icon: "$icon" }, // Mengelompokkan berdasarkan name dan _id
          },
        },
        {
          $project: {
            _id: "$_id.id", // Menyalin nilai id
            name: "$_id.value", // Menyalin nilai name
            icon: "$_id.icon", // Menyalin nilai name
          },
        },
      ]),
    ]);

    responseAPI.GetPaginationResponse({
      res,
      page,
      limit,
      data: alias == "true" ? dAliasReffParam : dReffParam,
      total: alias == "true" ? dAliasReffParam.length : totalData,
    });
  } catch (err) {
    next(err);
  }
};

controller.findByInd = async (req, res, next) => {
  /*
    #swagger.tags = ['REF PARAMETER']
    #swagger.summary = 'ref parameter'
    #swagger.description = 'untuk referensi group'
  */
  try {
    const _id = req.params.id;

    const data = await SysRefparamSchema.findOne({ _id })
      .populate("icon")
      .select("-createdAt -updatedAt")
      .lean();
    if (!data) {
      throw new NotFoundError(`Data with id: ${_id} not found!`);
    }

    responseAPI.MethodResponse({
      res,
      method: methodConstant.PUT,
      data,
    });
  } catch (err) {
    next(err);
  }
};

controller.indexWebGroupType = async (req, res, next) => {
  /*
    #swagger.tags = ['REF PARAMETER']
    #swagger.summary = 'ref parameter'
    #swagger.description = 'untuk referensi group'
    #swagger.parameters['type'] = { default: '', description: 'Search by type' }
  */
  try {
    const filter = {};
    // Filter
    const { type = "" } = req.query;
    if (type.length) filter.type = type;

    // Fetch data
    const result = await SysRefparamSchema.aggregate([
      {
        $match: { ...filter },
      },
      {
        $group: { _id: "$type" },
      },
      {
        $project: {
          _id: "$_id",
          name: "$_id",
        },
      },
    ]);

    responseAPI.MethodResponse({
      res,
      method: methodConstant.GET,
      data: result,
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
    #swagger.tags = ['REF PARAMETER']
    #swagger.summary = 'ref parameter'
    #swagger.description = 'untuk referensi group'
    #swagger.parameters['obj'] = {
      in: 'body',
      description: 'Create role',
      schema: { $ref: '#/definitions/BodyRefParameterSchema' }
    }
  */
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const payload = req.body;

    payload.type = payload.type.toLowerCase().replace(" ", "_");
    payload.slug = payload.value.toLowerCase().replace(" ", "_");
    payload.value = payload.value;
    const iseExist = await SysRefparamSchema.findOne({ value: payload.value });

    if (iseExist) {
      throw new BadRequest(`Data with '${payload.value}' has available!`);
    }

    // create new data
    await SysRefparamSchema.create([payload], { session });

    // update data image
    if (![null, undefined].includes(payload?.icon)) {
      await SysUploadFileSchema.findOneAndUpdate(
        { _id: payload.icon },
        { is_active: true, is_cover: true },
        { session },
      );
    }

    session.commitTransaction();
    responseAPI.MethodResponse({
      res,
      method: methodConstant.POST,
      data: payload,
    });
  } catch (err) {
    session.abortTransaction();
    next(err);
  } finally {
    session.endSession();
  }
};

controller.update = async (req, res, next) => {
  /*
    #swagger.security = [{
      "bearerAuth": []
    }]
  */
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
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const payload = req.body;
    const _id = req.params.id;

    payload.type = payload.type.toLowerCase().replace(" ", "_");
    payload.slug = payload.value.toLowerCase().replace(" ", "_");
    const dExist = await SysRefparamSchema.findOne({ _id });

    if (dExist?.icon) {
      await sys_uploadfile.findOneAndUpdate(
        { _id: dExist.icon },
        { is_active: false, is_cover: false },
        { session },
      );
    }
    if (!dExist) {
      throw new NotFoundError(`Data with id: ${_id} not found!`);
    }

    const result = await SysRefparamSchema.findOneAndUpdate({ _id }, payload, {
      session,
    });

    if (result.icon) {
      await sys_uploadfile.findOneAndUpdate(
        { _id: result.icon },
        { is_active: true, is_cover: true },
        { session },
      );
    }
    session.commitTransaction();
    responseAPI.MethodResponse({
      res,
      method: methodConstant.PUT,
      data: null,
    });
  } catch (err) {
    session.abortTransaction();
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
    #swagger.tags = ['REF PARAMETER']
    #swagger.summary = 'ref parameter'
    #swagger.description = 'untuk referensi group'
  */
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const _id = req.params.id;

    const isExist = await SysRefparamSchema.findOne({ _id });
    if (!isExist) {
      throw new NotFoundError(`Data with id: ${_id} not found!`);
    }

    await Promise.all([
      await SysRefparamSchema.findOneAndDelete({ _id }, { session }),
      await sys_uploadfile.findOneAndUpdate(
        { _id: isExist.icon },
        { is_active: false, is_cover: false },
        { session },
      ),
    ]);

    await session.commitTransaction();
    responseAPI.MethodResponse({
      res,
      method: methodConstant.DELETE,
      data: null,
    });
  } catch (err) {
    session.abortTransaction();
    next(err);
  } finally {
    session.endSession();
  }
};

module.exports = controller;
