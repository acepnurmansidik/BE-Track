const fnc_loan = require("../../models/fnc_loan");
const responseAPI = require("../../../utils/response");
const { methodConstant } = require("../../../utils/constanta");
const { default: mongoose, mongo } = require("mongoose");
const SysFinancialLedgerSchema = require("../../models/sys_financial_ledger");
const FncLoanSchema = require("../../models/fnc_loan");
const SysRefparamSchema = require("../../models/sys_refparam");
const SysWalletSchema = require("../../models/sys_wallet");
const { credential } = require("firebase-admin");
const { NotFoundError } = require("../../../utils/errors");
const { urlUltra } = require("../../../utils/config");

const controller = {};

controller.index = async (req, res, next) => {
  /*
  #swagger.security = [{
    "bearerAuth": []
  }]
  */
  /*
    #swagger.tags = ['LOAN']
    #swagger.summary = 'api untuk menampilkan data loan/pinjaman'
    #swagger.description = 'listing data loan/pinjaman'
  */
  try {
    // filter by user
    const queryFilter = req.query;
    // get data from db
    const result = await SysFinancialLedgerSchema.aggregate([
      { $match: { menu: "loan" } },
      {
        $lookup: {
          from: "sys_refparameters",
          localField: "category_id",
          foreignField: "_id",
          as: "categoryDetails",
        },
      },
      { $unwind: "$categoryDetails" },
      // jika ingin populate dari sub _id tulis kuerinya saja seperti contoh di bawah tidak perlu di push ===
      {
        $lookup: {
          from: "sys_uploadfiles",
          localField: "categoryDetails.icon",
          foreignField: "_id",
          as: "categoryDetails.icon",
        },
      },
      {
        $unwind: "$categoryDetails.icon",
      },
      {
        $lookup: {
          from: "fnc_loans",
          localField: "source_id",
          foreignField: "_id",
          as: "loanDetails",
        },
      },
      {
        $unwind: "$loanDetails",
      },
      {
        $project: {
          _id: "$loanDetails._id",
          title: "$loanDetails.title",
          status_paid: "$loanDetails.status_paid",
          is_income: "$loanDetails.is_income",
          from_name: "$loanDetails.from_name",
          to_name: "$loanDetails.to_name",
          note: "$loanDetails.note",
          // due_date: {
          //   $dateToString: {
          //     format: "%Y-%m-%d %H:%M",
          //     date: "$loanDetails.due_date",
          //   },
          // },
          created_at: {
            $dateToString: {
              format: "%Y-%m-%d %H:%M",
              date: "$createdAt",
            },
          },
          nominal: "$loanDetails.nominal",
          image_url: { $concat: [urlUltra, "$categoryDetails.icon.name"] },
        },
      },
    ]);
    // send response
    responseAPI.MethodResponse({
      res,
      method: methodConstant.POST,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

controller.createNewLoan = async (req, res, next) => {
  /*
    #swagger.security = [{
      "bearerAuth": []
    }]
  */
  /*
    #swagger.tags = ['LOAN']
    #swagger.summary = 'api untuk menampilkan data loan/pinjaman'
    #swagger.description = 'listing data loan/pinjaman'
    #swagger.parameters['obj'] = {
      in: 'body',
      description: 'Create loan',
      schema: { $ref: '#/definitions/BodyLoanSchema' }
    }
  */
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    // get data payload from body
    const payload = req.body;
    // insert user login to payload
    payload.user_id = req.login.user_id;

    // cek jika income maka get data reffparam yang value nya loan-income jika tidak loan-outcome
    let filterReffparam = { type: "category" };
    if (payload.is_income) {
      filterReffparam.slug = "loan-income";
    } else {
      filterReffparam.slug = "loan-outcome";
    }

    const [dReffparam, dKurs, dWallet] = await Promise.all([
      SysRefparamSchema.findOne(filterReffparam).lean(),
      SysRefparamSchema.findOne({ slug: "idr" }).lean(),
      SysWalletSchema.findOne({ user_id: req.login.user_id }).lean(),
    ]);

    // Membuat dan menyimpan data pinjaman
    const dLoan = new FncLoanSchema(payload);
    await dLoan.save({ session });

    // Membuat data untuk SysFinancialLedger
    const dFncLedger = new SysFinancialLedgerSchema({
      user_id: payload.user_id,
      amount: payload.nominal,
      total_amount: payload.nominal,
      kurs_amount: 1,
      note: payload.note,
      menu: "loan",
      source_id: dLoan._id,
      category_id: dReffparam._id,
      type_id: dReffparam.parent_id,
      kurs_id: dKurs._id,
      bank_id: dWallet._id,
      isIncome: payload.is_income,
    });
    // Menyimpan data ledger
    await dFncLedger.save({ session });

    // Jika semua operasi berhasil, commit transaksi
    await session.commitTransaction();
    // send response
    responseAPI.MethodResponse({
      res,
      method: methodConstant.POST,
      data: null,
    });
  } catch (err) {
    await session.abortTransaction();
    next(err);
  } finally {
    await session.endSession();
  }
};

controller.updateLoan = async (req, res, next) => {
  /*
    #swagger.security = [{
      "bearerAuth": []
    }]
  */
  /*
    #swagger.tags = ['LOAN']
    #swagger.summary = 'api untuk menampilkan data loan/pinjaman'
    #swagger.description = 'listing data loan/pinjaman'
    #swagger.parameters['obj'] = {
      in: 'body',
      description: 'Create loan',
      schema: { $ref: '#/definitions/BodyLoanSchema' }
    }
  */
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    // get data payload from body
    const payload = req.body;
    const _id = req.params.id;

    // insert user login to payload
    payload.user_id = req.login.user_id;

    // cek jika income maka get data reffparam yang value nya loan-income jika tidak loan-outcome
    let filterReffparam = {};
    if (payload.from_to == "You") {
      filterReffparam.slug = "loan-income";
    } else {
      filterReffparam.slug = "loan-outcome";
    }

    const [dLoan, dReffparam, dKurs, dWallet] = await Promise.all([
      fnc_loan.findOne({ _id }),
      SysRefparamSchema.findOne(filterReffparam).lean(),
      SysRefparamSchema.findOne({ slug: "idr" }).select("_id").lean(),
      SysWalletSchema.findOne({ user_id: req.login.user_id })
        .select("_id")
        .lean(),
    ]);

    if (!dLoan) {
      return new NotFoundError(`Data with id: ${_id} not found`);
    }

    await Promise.all([
      // update dataloan and
      fnc_loan.findOneAndUpdate({ _id }, payload, { session }),

      // then update finance ledger
      SysFinancialLedgerSchema.findOneAndUpdate(
        { source_id: _id },
        {
          user_id: payload.user_id,
          amount: payload.nominal,
          total_amount: payload.nominal,
          kurs_amount: 1,
          note: payload.note,
          menu: "loan",
          source_id: _id,
          category_id: dReffparam._id,
          type_id: dReffparam.parent_id,
          kurs_id: dKurs._id,
          bank_id: dWallet._id,
          isIncome: payload.from_to == "You" ? true : false,
        },
        { session },
      ),
    ]);

    await session.commitTransaction();
    // send response
    responseAPI.MethodResponse({
      res,
      method: methodConstant.PUT,
      data: null,
    });
  } catch (err) {
    await session.abortTransaction();
    next(err);
  } finally {
    await session.endSession();
  }
};

controller.deleteLoan = async (req, res, next) => {
  /*
    #swagger.security = [{
      "bearerAuth": []
    }]
  */
  /*
    #swagger.tags = ['LOAN']
    #swagger.summary = 'api untuk menampilkan data loan/pinjaman'
    #swagger.description = 'listing data loan/pinjaman'
    #swagger.parameters['obj'] = {
      in: 'body',
      description: 'Create loan',
      schema: { $ref: '#/definitions/BodyLoanSchema' }
    }
  */
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    // get data payload from body
    const payload = req.body;
    const _id = req.params.id;

    // insert user login to payload
    payload.user_id = req.login.user_id;

    await Promise.all([
      // delete dataloan and
      fnc_loan.findOneAndDelete({ _id }),

      // then delete finance ledger
      SysFinancialLedgerSchema.findOneAndDelete(
        { source_id: _id },
        { session },
      ),
    ]);

    await session.commitTransaction();
    // send response
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
