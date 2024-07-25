const SysFinancialLedgerSchema = require("../../models/sys_financial_ledger");
const SysRefparamSchema = require("../../models/sys_refparam");
const responseAPI = require("../../../utils/response");
const { methodConstant } = require("../../../utils/constanta");
const { BadRequestError } = require("../../../utils/errors");
const { DateTime } = require("luxon");
const admin = require("firebase-admin");
const serviceAccount = require("../../../../serviceAccountKey.json");

const controller = {};

controller.index = async (req, res, next) => {
  try {
    /*
    #swagger.security = [{
      "bearerAuth": []
    }]
  */
    /*
    #swagger.tags = ['FINANCE']
    #swagger.summary = 'ref parameter'
    #swagger.description = 'untuk referensi group'
  */
    const query = req.query;
    /**
     * Penjelasan
      1. Model Mongoose:

      exampleSchema: Skema yang memiliki field name dan createdAt. Field createdAt diatur dengan default Date.now.
      2. Agregasi MongoDB:

      $group: Mengelompokkan dokumen berdasarkan hasil dari $dateToString.
      $dateToString: Mengonversi tanggal createdAt ke format "MMMM yyyy".
      count: { $sum: 1 }: Menghitung jumlah dokumen dalam setiap grup.
      $sort: Mengurutkan hasil berdasarkan _id yang berisi bulan dan tahun.
     */

    const [listData, [grand_total], [current_monthly]] = await Promise.all([
      SysFinancialLedgerSchema.aggregate([
        { $match: query },
        {
          $lookup: {
            from: "sys_refparameters",
            localField: "type_id",
            foreignField: "_id",
            as: "typeDetails",
          },
        },
        {
          $unwind: "$typeDetails",
        },
        {
          $lookup: {
            from: "sys_refparameters",
            localField: "category_id",
            foreignField: "_id",
            as: "categoryDetails",
          },
        },
        {
          $unwind: "$categoryDetails",
        },
        {
          $lookup: {
            from: "sys_refparameters",
            localField: "kurs_id",
            foreignField: "_id",
            as: "kursDetails",
          },
        },
        {
          $unwind: "$kursDetails",
        },
        {
          $group: {
            _id: {
              $dateToString: { format: "%B %Y", date: "$createdAt" },
            },
            total_monthly: { $sum: "$total_amount" },
            items: {
              $push: {
                _id: "$_id",
                amount: "$amount",
                note: "$note",
                total_amount: "$total_amount",
                kurs_amount: "$kurs_amount",
                is_income: "$isIncome",
                datetime: {
                  $dateToString: {
                    format: "%d %B %Y | %H:%M",
                    timezone: "Asia/Jakarta",
                    date: "$createdAt",
                  },
                },
                type_id: "$typeDetails",
                category_id: "$categoryDetails",
                kurs_id: "$kursDetails",
              },
            },
          },
        },
        {
          $project: {
            _id: 1,
            total_monthly: 1,
            "items._id": 1,
            "items.amount": 1,
            "items.kurs_amount": 1,
            "items.total_amount": 1,
            "items.note": 1,
            "items.is_income": 1,
            "items.datetime": 1,
            "items.type_id": {
              _id: 1,
              value: 1,
              description: 1,
            },
            "items.category_id": {
              _id: 1,
              value: 1,
              description: 1,
            },
            "items.kurs_id": {
              _id: 1,
              value: 1,
              description: 1,
            },
          },
        },
        {
          $sort: {
            createdAt: 1,
          },
        },
      ]),
      SysFinancialLedgerSchema.aggregate([
        {
          $group: {
            _id: null,
            grand_total: { $sum: "$total_amount" },
          },
        },
      ]),
      SysFinancialLedgerSchema.aggregate([
        {
          $match: {
            createdAt: {
              $gte: DateTime.utc().startOf("month"),
              $lte: DateTime.utc().endOf("month"),
            },
          },
        },
        {
          $group: {
            _id: null,
            current_monthly: { $sum: "$total_amount" },
          },
        },
      ]),
    ]);

    responseAPI.MethodResponse({
      res,
      method: methodConstant.GET,
      data: {
        list_data: listData,
        grand_total: grand_total.grand_total,
        current_monthly: current_monthly.current_monthly,
      },
      // data: listData,
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
    #swagger.tags = ['FINANCE']
    #swagger.summary = 'ref parameter'
    #swagger.description = 'untuk referensi group'
    #swagger.parameters['obj'] = {
      in: 'body',
      description: 'Create role',
      schema: { $ref: '#/definitions/BodyFinancialLedgerSchema' }
    }
  */
    const payload = req.body;

    console.log(req.headers);

    const [typeRef, categoryRef] = await Promise.all([
      SysRefparamSchema.findOne({ _id: payload.type_id }),
      SysRefparamSchema.findOne({ _id: payload.category_id }),
    ]);

    if (typeRef._id.toString() != categoryRef.parent_id.toString()) {
      throw new BadRequestError("Category no match!");
    }

    payload.total_amount = payload.amount * payload.kurs_amount;
    payload.isIncome = typeRef.value.toLowerCase() == "income" ? true : false;

    const data = await SysFinancialLedgerSchema.create(payload);

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    responseAPI.MethodResponse({
      res,
      method: methodConstant.POST,
      data,
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
    #swagger.tags = ['FINANCE']
    #swagger.summary = 'ref parameter'
    #swagger.description = 'untuk referensi group'
    #swagger.parameters['obj'] = {
      in: 'body',
      description: 'Create role',
      schema: { $ref: '#/definitions/BodyFinancialLedgerSchema' }
    }
  */
    const payload = req.body;
    const _id = req.params.id;

    const [typeRef, categoryRef] = await Promise.all([
      SysRefparamSchema.findOne({ _id: payload.type_id }),
      SysRefparamSchema.findOne({ _id: payload.category_id }),
    ]);

    if (typeRef._id.toString() != categoryRef.parent_id.toString()) {
      throw new BadRequestError("Category no match!");
    }

    payload.total_amount = payload.amount * payload.kurs_amount;

    console.log(payload);
    const data = await SysFinancialLedgerSchema.findOneAndUpdate(
      { _id },
      payload,
    );

    responseAPI.MethodResponse({
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
    #swagger.tags = ['FINANCE']
    #swagger.summary = 'ref parameter'
    #swagger.description = 'untuk referensi group'
  */
    const _id = req.params.id;

    await SysFinancialLedgerSchema.findOneAndDelete({ _id });

    responseAPI.MethodResponse({
      res,
      method: methodConstant.DELETE,
      data: null,
    });
  } catch (err) {
    next();
  }
};

module.exports = controller;
