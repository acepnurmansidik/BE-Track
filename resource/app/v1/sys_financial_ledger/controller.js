const SysFinancialLedgerSchema = require("../../models/sys_financial_ledger");
const SysRefparamSchema = require("../../models/sys_refparam");
const responseAPI = require("../../../utils/response");
const { methodConstant } = require("../../../utils/constanta");
const { BadRequestError } = require("../../../utils/errors");
const { format } = require("morgan");

const controller = {};

controller.index = async (req, res, next) => {
  try {
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
    const data = await SysFinancialLedgerSchema.aggregate([
      { $match: query },
      {
        $group: {
          _id: {
            $dateToString: { format: "%B %Y", date: "$createdAt" },
          },
          items: {
            $push: {
              _id: "$_id",
              amount: "$amount",
              note: "$note",
              type_id: "$type_id",
              category_id: "$category_id",
              datetime: {
                $dateToString: {
                  format: "%d %B %Y | %H:%M",
                  timezone: "Asia/Jakarta",
                  date: "$createdAt",
                },
              },
            },
          },
        },
      },
      {
        $sort: { _id: 1 },
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

controller.create = async (req, res, next) => {
  try {
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

    const [typeRef, categoryRef] = await Promise.all([
      SysRefparamSchema.findOne({ _id: payload.type_id }),
      SysRefparamSchema.findOne({ _id: payload.category_id }),
    ]);

    if (typeRef._id.toString() != categoryRef.parent_id.toString()) {
      throw new BadRequestError("Category no match!");
    }

    const data = await SysFinancialLedgerSchema.create(payload);

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
