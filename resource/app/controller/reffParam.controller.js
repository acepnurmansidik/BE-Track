const SysRefparamSchema = require("../models/reffParam.model");
const globalFunc = require("../../utils/global-func");
const { methodConstant } = require("../../utils/constanta");

const controller = {};

controller.index = async (req, res, next) => {
  try {
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

    globalFunc.MethodResponse({
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
    const payload = req.body;
    payload.type = payload.type.toLowerCase().replace(" ", "_");
    payload.value = payload.value.toLowerCase();
    const data = await SysRefparamSchema.create(payload);

    globalFunc.MethodResponse({
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
    const payload = req.body;
    const _id = req.params.id;

    payload.type = payload.type.toLowerCase().replace(" ", "_");
    payload.value = payload.value.toLowerCase();
    const data = await SysRefparamSchema.findOneAndUpdate({ _id }, payload);

    globalFunc.MethodResponse({
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
    #swagger.security = [{
      "bearerAuth": []
    }]
  */
    /*
    #swagger.tags = ['REF PARAMETER']
    #swagger.summary = 'ref parameter'
    #swagger.description = 'untuk referensi group'
  */
    const _id = req.params.id;

    await SysRefparamSchema.findOneAndDelete({ _id });

    globalFunc.MethodResponse({
      res,
      method: methodConstant.DELETE,
      data: null,
    });
  } catch (err) {
    next();
  }
};

module.exports = controller;
