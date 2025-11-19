const { default: mongoose } = require("mongoose");
const crudServices = require("../../helper/crudService");
const LoanModel = require("../models/loan.model");
const TransactionModel = require("../models/transactions.model");
const WalletModel = require("../models/ewallet.model");
const globalService = require("../../helper/global-func");
const ReffParamModel = require("../models/reffParam.model");
const { DateTime } = require("luxon");
const { server } = require("../../utils/config");
const LogActionModel = require("../models/logAction.model");

const controller = {};

/* ========================================================================
 *  LOAN CONTROLLER — CLEAN CODE VERSION
 *  Semua komentar asli dipertahankan
 * ======================================================================== */

controller.indexLoan = async (req, res, next) => {
  const { search, status = "ongoing" } = req.query;

  const query = {
    is_delete: false,
    user_id: req.login.user_id,
  };

  const arrFilter = [];

  if (status.length) query.status = status;

  if (search) {
    arrFilter.push({ partner_name: { $regex: search, $options: "i" } });
  }

  if (arrFilter.length) query["$or"] = arrFilter;

  const populateField = [];

  /*
    #swagger.security = [{
      "bearerAuth": []
    }]
  */

  /*
    #swagger.tags = ['LOAN']
    #swagger.summary = 'Create loan'
    #swagger.description = 'Create loan'
    #swagger.parameters['search'] = { default: '', description: 'Search by type wallet name, va number' }
    #swagger.parameters['status'] = { default: '', description: 'all, ongoing, paid' }
  */

  try {
    const dLoan = await LoanModel.find(query).lean();

    res.status(200).json({
      success: true,
      message: "Data retrieved successfully!",
      data: dLoan,
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ success: false, message: error.message, data: null });
  }
};

/* ========================================================================
 *  CREATE LOAN
 * ======================================================================== */

controller.createLoan = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  /*
    #swagger.security = [{
      "bearerAuth": []
    }]
  */

  /*
    #swagger.tags = ['LOAN']
    #swagger.summary = 'Create loan'
    #swagger.description = 'Create loan'
    #swagger.parameters['obj'] = {
      in: 'body',
      description: 'Create loan',
      schema: { $ref: '#/definitions/BodyCreateLoanSchema' }
    }
  */

  try {
    const dLogger = [];
    const payload = req.body;
    const user_id = req.login.user_id.toString();

    // get data reffparam & wallet
    const [dReffCategory, dReffType, dWallet] = await Promise.all([
      ReffParamModel.findOne({ slug: "loan", type: "category" })
        .select("_id value")
        .lean(),
      ReffParamModel.findOne({ value: "loan", type: "cashflow_type" })
        .select("_id value")
        .lean(),
      WalletModel.findOne({ _id: payload.wallet_id, user_id })
        .select("_id value amount")
        .lean(),
    ]);

    // check data master
    if (!dReffCategory || !dReffType) {
      return res.status(500).json({
        success: false,
        message: "Data loan not found!",
        data: null,
      });
    }

    // check data wallet
    if (!dWallet) {
      return res.status(500).json({
        success: false,
        message: "Wallet not found!",
        data: null,
      });
    }

    // create transaction
    const dTransaction = await TransactionModel.create(
      [
        {
          user_id,
          transaction_code: globalService.generateUniqueCode({
            customeCode: "LOAN",
          }),
          source: "loan",
          menu: "loan",
          is_paid: true,
          total_amount: payload.amount,
          note: payload.note,
          category_id: dReffCategory._id,
          category_name: dReffCategory.value,
          type_id: dReffType._id,
          type_name: dReffType.value,
          wallet_id: payload.wallet_id,
        },
      ],
      { session },
    );

    // create loan data
    const dLoan = await LoanModel.create(
      [
        {
          ...payload,
          user_id,
          payment_terms: [],
          initial_transaction_id: dTransaction[0]._id,
          loan_id: globalService.generateUniqueCode({ lengthCode: 11 }),
        },
      ],
      { session },
    );

    dLogger.push({
      type: "CREATE",
      target_id: dLoan[0]._id,
      after: dLoan[0],
      source: LoanModel.collection.collectionName,
    });

    // update source_id at transaction
    const dTransactionUpdated = await TransactionModel.findOneAndUpdate(
      { _id: dTransaction[0]._id },
      { source_id: dLoan[0]._id },
      { session, new: true },
    );

    dLogger.push({
      type: "UPDATE",
      target_id: dTransaction[0]._id,
      after: dTransactionUpdated,
      source: TransactionModel.collection.collectionName,
    });

    // update wallet amount
    const dWalletUpdate = await WalletModel.findOneAndUpdate(
      { _id: dWallet._id },
      {
        $inc: {
          amount: payload.is_borrow ? payload.amount : -payload.amount,
        },
      },
      { session, new: true },
    );

    dLogger.push({
      type: "UPDATE",
      target_id: dWalletUpdate._id,
      before: dWallet,
      after: dWalletUpdate,
      source: WalletModel.collection.collectionName,
    });

    // create log action
    await LogActionModel.create(dLogger);

    await session.commitTransaction();

    res.status(200).json({
      success: true,
      message: "Data created successfully!",
      data: null,
    });
  } catch (error) {
    await session.abortTransaction();
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message,
      data: null,
    });
  } finally {
    await session.endSession();
  }
};

/* ========================================================================
 *  UPDATE LOAN PAYMENT TERM
 * ======================================================================== */

controller.updateLoanPayment = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  const populateField = [
    { path: "initial_transaction_id", select: "_id wallet_id" },
  ];

  /*
    #swagger.security = [{
      "bearerAuth": []
    }]
  */

  /*
    #swagger.tags = ['LOAN']
    #swagger.summary = 'Update loan'
    #swagger.description = 'Create loan'
    #swagger.parameters['obj'] = {
      in: 'body',
      description: 'Update loan',
      schema: { $ref: '#/definitions/BodyUpdateLoanSchema' }
    }
  */

  try {
    const dLogger = [];
    const payload = req.body;
    const user_id = req.login.user_id.toString();

    // VALIDATE ===================================================================
    const [dReffCategory, dReffType, dWallet, isdLoanAvailable] =
      await Promise.all([
        ReffParamModel.findOne({ slug: "loan", type: "category" })
          .select("_id value")
          .lean(),
        ReffParamModel.findOne({ value: "loan", type: "cashflow_type" })
          .select("_id value")
          .lean(),
        WalletModel.findOne({ _id: payload.wallet_id, user_id })
          .select("_id value")
          .lean(),
        LoanModel.findOne({
          _id: req.params.id,
          user_id,
        })
          .populate(populateField)
          .lean(),
      ]);

    // check data master
    if (!dReffCategory || !dReffType) {
      return res.status(500).json({
        success: false,
        message: "Data loan not found!",
        data: null,
      });
    }

    // check data loan
    if (!isdLoanAvailable) {
      return res.status(404).json({
        success: false,
        message: `Data with id: ${req.params.id} is not not found!`,
        data: null,
      });
    }
    // ============================================================================

    // make transactions for payment term
    const dTransaction = await TransactionModel.create(
      [
        {
          user_id,
          transaction_code: globalService.generateUniqueCode({
            customeCode: "LOAN",
          }),
          source: "loan",
          menu: "loan",
          is_paid: true,
          total_amount: payload.amount,
          note: payload.note,
          category_id: dReffCategory._id,
          category_name: dReffCategory.value,
          type_id: dReffType._id,
          type_name: dReffType.value,
          wallet_id: isdLoanAvailable.initial_transaction_id.wallet_id,
        },
      ],
      { session },
    );

    dLogger.push({
      type: "CREATE",
      target_id: dTransaction[0]._id,
      after: dTransaction[0],
      source: TransactionModel.collection.collectionName,
    });

    const payment_terms = [
      ...isdLoanAvailable.payment_terms,
      {
        paid_at: DateTime.now().setZone(server.timeZone),
        amount: payload.amount,
        paid: true,
        transaction_id: dTransaction[0]._id,
      },
    ];

    // update loan
    const dLoanUpdated = await LoanModel.findOneAndUpdate(
      { _id: isdLoanAvailable._id },
      {
        ...payload,
        payment_terms,
        $inc: { paid_amount: payload.amount },
      },
      { session, new: true },
    );

    dLogger.push({
      type: "UPDATE",
      target_id: dLoanUpdated._id,
      before: isdLoanAvailable,
      after: dLoanUpdated,
      source: LoanModel.collection.collectionName,
    });

    // update wallet
    const dWalletUpdate = await WalletModel.findOneAndUpdate(
      { _id: isdLoanAvailable.initial_transaction_id.wallet_id },
      {
        $inc: {
          amount: isdLoanAvailable.is_borrow ? -payload.amount : payload.amount,
        },
      },
      { session, new: true },
    );

    dLogger.push({
      type: "UPDATE",
      target_id: dWalletUpdate._id,
      before: dWallet,
      after: dWalletUpdate,
      source: WalletModel.collection.collectionName,
    });

    // logging
    await LogActionModel.create([dLogger], { session });

    await session.commitTransaction();

    res.status(201).json({
      success: true,
      message: "Data updated successfully!",
      data: null,
    });
  } catch (error) {
    await session.abortTransaction();
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message,
      data: null,
    });
  } finally {
    await session.endSession();
  }
};

/* ========================================================================
 *  DELETE PAYMENT TERM LOAN
 * ======================================================================== */

controller.deletePaymentTermLoan = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  const populateField = [{ path: "initial_transaction_id" }];

  /*
    #swagger.security = [{
      "bearerAuth": []
    }]
  */

  /*
    #swagger.tags = ['LOAN']
    #swagger.summary = 'Update loan payment term'
    #swagger.description = 'Update loan'
  */

  try {
    // VALIDATE ===================================================================
    const [isdLoanAvailable, isdTrxAvailable] = await Promise.all([
      LoanModel.findOne({ _id: req.params.id }).lean(),
      TransactionModel.findOne({ _id: req.params.trxId })
        .populate(populateField)
        .lean(),
    ]);

    if (!isdLoanAvailable) {
      return res.status(404).json({
        success: false,
        message: `Data with id: ${req.params.id} is not not found!`,
        data: null,
      });
    }

    if (!isdTrxAvailable) {
      return res.status(404).json({
        success: false,
        message: `Data with id: ${req.params.trxId} is not not found!`,
        data: null,
      });
    }

    if (isdLoanAvailable.status == "paid") {
      return res.status(400).json({
        success: false,
        message: `Data has been paid!`,
        data: null,
      });
    }
    // ============================================================================

    const WalletId = isdTrxAvailable.wallet_id;
    delete isdTrxAvailable.wallet_id;

    // Cari payment term yang sesuai
    const payment_terms_selected = isdLoanAvailable.payment_terms.find(
      (item) => item.transaction_id === req.params.trxId,
    );

    // Update payment term: tambahkan flag is_delete
    const payment_terms = isdLoanAvailable.payment_terms.map((item) => {
      if (item.transaction_id === req.params.trxId) {
        return { ...item, is_delete: true };
      }
      return item;
    });

    // UPDATE (loan, transaction, wallet)
    const [dLoanUpdated, dTransactionUpdated, dWalletUpdate] =
      await Promise.all([
        LoanModel.findOneAndUpdate(
          { _id: isdLoanAvailable._id },
          {
            payment_terms,
            $inc: { paid_amount: -payment_terms_selected.amount },
          },
          { session, new: true },
        ),
        TransactionModel.findOneAndUpdate(
          { _id: isdTrxAvailable._id },
          { is_delete: true },
          { session, new: true },
        ),
        WalletModel.findOneAndUpdate(
          { _id: WalletId._id },
          {
            $inc: {
              amount: isdLoanAvailable.is_borrow
                ? payment_terms_selected.amount
                : -payment_terms_selected.amount,
            },
          },
          { session, new: true },
        ),
      ]);

    // LOG ACTION
    await LogActionModel.create(
      [
        {
          type: "UPDATE",
          target_id: dLoanUpdated._id,
          before: isdLoanAvailable,
          after: dLoanUpdated,
          source: LoanModel.collection.collectionName,
        },
        {
          type: "UPDATE",
          target_id: dTransactionUpdated._id,
          before: isdTrxAvailable,
          after: dTransactionUpdated,
          source: TransactionModel.collection.collectionName,
        },
        {
          type: "UPDATE",
          target_id: dWalletUpdate._id,
          before: WalletId,
          after: dWalletUpdate,
          source: WalletModel.collection.collectionName,
        },
      ],
      { session },
    );

    await session.commitTransaction();

    res.status(200).json({
      success: true,
      message: "Payment term deleted successfully!",
      data: null,
    });
  } catch (error) {
    await session.abortTransaction();
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
      data: null,
    });
  } finally {
    await session.endSession();
  }
};

/* ========================================================================
 *  DELETE LOAN
 * ======================================================================== */

controller.deleteLoan = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  const populateField = [{ path: "initial_transaction_id" }];

  try {
    const dLogger = [];
    const user_id = req.login.user_id.toString(); // cari data pinjaman

    const dLoanAvailable = await LoanModel.findOne({
      _id: req.params.id,
      user_id,
    })
      .populate(populateField)
      .lean();

    if (!dLoanAvailable) {
      return res
        .status(500)
        .json({ success: false, message: "Data loan not found!", data: null });
    }
    // LOAN
    const dLoanUpdated = await LoanModel.findOneAndUpdate(
      { _id: req.params.id },
      { is_delete: true },
      { session },
    );
    dLogger.push({
      type: "UPDATE",
      target_id: dLoanUpdated._id,
      before: dLoanAvailable,
      after: dLoanUpdated,
      source: LoanModel.collection.collectionName,
    });

    // WALLET
    // update jumlah amountya wallet dari field paid_amount jika ada, jika tidak ada ambil dari amount
    const walletAmount = dLoanAvailable.paid_amount ?? dLoanAvailable.amount;
    const dWalletUpdate = await WalletModel.findOneAndUpdate(
      { _id: dLoanAvailable.initial_transaction_id.wallet_id },
      {
        $inc: {
          amount: dLoanAvailable.is_borrow ? -walletAmount : walletAmount,
        },
      },
      { session },
    );
    dLogger.push({
      type: "UPDATE",
      target_id: dWalletUpdate._id,
      before: dLoanAvailable.initial_transaction_id.wallet_id,
      after: dWalletUpdate,
      source: WalletModel.collection.collectionName,
    });

    // TRANSACTION
    // cari data log data pembyaranya di field payment_term(is_delete false), jika ada update transaksi
    if (dLoanAvailable.paid_amount) {
      for (const everyItem of dLoanAvailable.payment_terms) {
        const dTransaction = await TransactionModel.findOne({
          _id: everyItem.transaction_id,
        }).lean();
        const dTransactionUpdated = await TransactionModel.findOneAndUpdate(
          { _id: everyItem.transaction_id },
          { is_delete: true },
          { session },
        );
        dLogger.push({
          type: "UPDATE",
          target_id: dTrxUpdated._id,
          before: dTransaction,
          after: dTransactionUpdated,
          source: TransactionModel.collection.collectionName,
        });
      }
    }

    await LogActionModel.create(dLogger, { session });
    await session.commitTransaction();
    res.status(200).json({
      success: true,
      message: "Payment term deleted successfully!",
      data: null,
    });
  } catch (error) {
    await session.abortTransaction();
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
      data: null,
    });
  } finally {
    await session.endSession();
  }
};

module.exports = controller;
