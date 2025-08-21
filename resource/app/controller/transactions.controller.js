const { default: mongoose } = require("mongoose");
const ReffParamModel = require("../models/reffParam.model");
const WalletModel = require("../models/ewallet.model");
const TransactionModel = require("../models/transactions.model");
const LogActionModel = require("../models/logAction.model");
const crudServices = require("../../helper/crudService");

const controller = {};

controller.indexAllTransaction = async (req, res, next) => {
  const selectField = "-menu -user_id -category_name -type_name";
  const { limit, page, ...query } = req.query;
  const skip = (Number(page) - 1) * limit;
  /*
  #swagger.security = [{
    "bearerAuth": []
  }]
  */
  /*
    #swagger.tags = ['TRANSACTION']
    #swagger.summary = 'Get transaction'
    #swagger.description = 'Get transaction'
    #swagger.parameters['limit'] = { default: 10, description: 'limit' }
    #swagger.parameters['page'] = { default: 1, description: 'page' }
  */
  try {
    const populateField = [
      { path: "type_id", select: "_id value" },
      { path: "category_id", select: "_id value" },
      { path: "wallet_id", select: "_id wallet_name" },
    ];
    const page_size = await TransactionModel.countDocuments(query);
    const result = await crudServices.findAllPagination(TransactionModel, {
      query: { ...query, user_id: req.login.user_id },
      populateField,
      skip,
      limit,
      selectField,
    });

    res.status(200).json({ ...result, page_size, current_page: Number(page) });
  } catch (error) {
    console.error(error);
    res.status(400).json({ status: false, message: error.message, data: null });
  }
};

controller.getAllTransaction = async (req, res, next) => {
  const selectField = "-menu -user_id -category_id -type_id -wallet_id";
  let { limit, page, ...query } = req.query;
  const skip = (Number(page) - 1) * limit;
  query = { ...query };
  /*
  #swagger.security = [{
    "bearerAuth": []
  }]
  */
  /*
    #swagger.tags = ['TRANSACTION']
    #swagger.summary = 'Get transaction'
    #swagger.description = 'Get transaction'
    #swagger.parameters['limit'] = { default: 10, description: 'limit' }
    #swagger.parameters['page'] = { default: 1, description: 'page' }
  */
  try {
    const result = await crudServices.findAll(TransactionModel, {
      query,
      skip,
      limit,
      selectField,
    });

    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(400).json({ status: false, message: error.message, data: null });
  }
};

controller.createTransaction = async (req, res, next) => {
  const userLogin = req.login; // get user id from login session
  const session = await mongoose.startSession();
  session.startTransaction();
  /*
    #swagger.security = [{
      "bearerAuth": []
    }]
  */
  /*
    #swagger.tags = ['TRANSACTION']
    #swagger.summary = 'Create transaction'
    #swagger.description = 'Create transaction'
    #swagger.parameters['obj'] = {
      in: 'body',
      description: 'Create role',
      schema: { $ref: '#/definitions/BodyTransactionSchema' }
    }
  */
  try {
    const payload = req.body;
    const [typeReff, categoryReff, walletReff] = await Promise.all([
      ReffParamModel.findOne({ _id: payload.type_id }),
      ReffParamModel.findOne({ _id: payload.category_id }),
      WalletModel.findOne({
        _id: payload.wallet_id,
        user_id: userLogin.user_id,
      }),
    ]);

    if (!typeReff || !categoryReff) {
      throw new Error("Invalid type or category");
    }

    if (!walletReff) {
      throw new Error("Invalid wallet");
    }

    payload.category_name = categoryReff.value;
    payload.type_name = typeReff.value;
    payload.user_id = userLogin.user_id;

    const [walletUpdate, createTrx] = await Promise.all([
      await WalletModel.findOneAndUpdate(
        { _id: walletReff._id },
        {
          $inc: {
            amount:
              typeReff.value == "income"
                ? payload.total_amount
                : -payload.total_amount,
          },
        },

        { session, new: true },
      ),
      await TransactionModel.create([payload], { session }),
    ]);

    const logAction = [
      {
        type: "CREATE",
        target_id: createTrx[0]._id, // id of the created document
        after: createTrx[0],
        source: TransactionModel.collection.collectionName,
      },
      {
        type: "UPDATE",
        target_id: walletReff._id, // id of the created document
        before: walletReff,
        after: walletUpdate,
        source: WalletModel.collection.collectionName,
      },
    ];

    await LogActionModel.insertMany(logAction, { session });

    await session.commitTransaction();
    res
      .status(200)
      .json({ status: true, message: "Data saved successfully", data: null });
  } catch (error) {
    console.error(error);
    await session.abortTransaction();
    res.status(400).json({ status: false, message: error.message, data: null });
  } finally {
    await session.endSession();
  }
};

controller.updateTransaction = async (req, res, next) => {
  const userLogin = req.login; // get user id from login session
  const session = await mongoose.startSession();
  session.startTransaction();
  /*
    #swagger.security = [{
      "bearerAuth": []
    }]
  */
  /*
    #swagger.tags = ['TRANSACTION']
    #swagger.summary = 'Create transaction'
    #swagger.description = 'Create transaction'
    #swagger.parameters['obj'] = {
      in: 'body',
      description: 'Create role',
      schema: { $ref: '#/definitions/BodyTransactionSchema' }
    }
  */
  try {
    const payload = req.body;
    const [transactionReff, typeReff, categoryReff, walletReff] =
      await Promise.all([
        TransactionModel.findOne({ _id: req.params.id, is_delete: false }),
        ReffParamModel.findOne({ _id: payload.type_id }),
        ReffParamModel.findOne({ _id: payload.category_id }),
        WalletModel.findOne({
          _id: payload.wallet_id,
          user_id: userLogin.user_id,
        }),
      ]);

    if (!transactionReff) {
      throw new Error("Data not found!");
    }

    if (!typeReff || !categoryReff) {
      throw new Error("Invalid type or category");
    }

    if (!walletReff) {
      throw new Error("Invalid wallet");
    }

    if (
      typeReff.value.toLowerCase() == "income" &&
      transactionReff.type_name == "income"
    ) {
      payload.isIncome = true;
      walletReff.amount =
        Number(payload.total_amount) +
        (walletReff.amount - transactionReff.total_amount);
    } else if (
      typeReff.value.toLowerCase() == "outcome" &&
      transactionReff.type_name == "income"
    ) {
      payload.isIncome = false;
      walletReff.amount =
        walletReff.amount -
        (transactionReff.total_amount + Number(payload.total_amount));
    } else if (
      typeReff.value.toLowerCase() == "outcome" &&
      transactionReff.type_name == "outcome"
    ) {
      walletReff.amount =
        walletReff.amount +
        transactionReff.total_amount -
        Number(payload.total_amount);
    } else if (
      typeReff.value.toLowerCase() == "income" &&
      transactionReff.type_name == "outcome"
    ) {
      walletReff.amount = walletReff.amount + Number(payload.total_amount);
    }

    payload.category_name = categoryReff.value;
    payload.type_name = typeReff.value;
    payload.user_id = userLogin.user_id;

    const [walletUpdate, newTrxUpdated] = await Promise.all([
      await WalletModel.findOneAndUpdate(
        { _id: walletReff._id },
        { $inc: { amount: walletReff.amount } },
        { session, new: true },
      ),
      await TransactionModel.findOneAndUpdate({ _id: req.params.id }, payload, {
        session,
      }),
    ]);

    const logAction = [
      {
        type: "UPDATE",
        target_id: transactionReff._id, // id of the created document
        before: transactionReff,
        after: newTrxUpdated,
        source: TransactionModel.collection.collectionName,
      },
      {
        type: "UPDATE",
        target_id: walletReff._id, // id of the created document
        before: walletReff,
        after: walletUpdate,
        source: WalletModel.collection.collectionName,
      },
    ];

    await LogActionModel.insertMany(logAction, { session });

    await session.commitTransaction();
    res
      .status(200)
      .json({ status: true, message: "Data updated successfully", data: null });
  } catch (error) {
    await session.abortTransaction();
    console.error(error);
    res.status(400).json({ status: false, message: error.message, data: null });
  } finally {
    await session.endSession();
  }
};

controller.deleteTransaction = async (req, res, next) => {
  /*
    #swagger.security = [{
      "bearerAuth": []
    }]
  */
  /*
    #swagger.tags = ['TRANSACTION']
    #swagger.summary = 'Delete transaction'
    #swagger.description = 'Delete transaction'
  */
  try {
    const result = await crudServices.delete(TransactionModel, {
      id: req.params.id,
    });

    res.status(200).json(result);
  } catch (error) {
    console.log(error);
    res.status(400).json({ status: false, message: error.message, data: null });
  }
};

// ======================================================================================
// CHART DATA ===========================================================================

controller.transactionCategoriesPeriode = async (req, res, next) => {
  /*
    #swagger.security = [{
      "bearerAuth": []
    }]
  */
  /*
    #swagger.tags = ['TRANSACTION']
    #swagger.summary = 'user transaction yearly report'
    #swagger.description = 'user transaction yearly report'
  */
  try {
    const query = {
      ...req.query,
      is_delete: false,
      user_id: req.login.user_id,
    };
    const monthlyGroup = await TransactionModel.aggregate([
      { $match: query },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" }, // Ambil tahun dari createdAt
            month: { $month: "$createdAt" }, // Ambil bulan dari createdAt
          },
        },
      },
      {
        $project: {
          _id: 0,
          month: "$_id.month",
          year: "$_id.year",
          periode: {
            $dateToString: {
              format: "%b %Y", // Format MM-YYYY (01-2023)
              date: {
                $dateFromParts: {
                  year: "$_id.year",
                  month: "$_id.month",
                  day: 1,
                },
              },
            },
          },
        },
      },
      {
        $sort: { year: -1, month: -1 }, // Urutkan hasil berdasarkan tahun, bulan, dan kategori
      },
    ]);

    const result = await TransactionModel.aggregate([
      { $match: query },
      {
        $group: {
          _id: {
            category: "$category_name", // Group by category_name
            month: { $month: "$createdAt" }, // Extract month from createdAt
            year: { $year: "$createdAt" }, // Extract year from createdAt
          },
          total_amount: { $sum: "$total_amount" },
          first_created: { $first: "$createdAt" }, // Get one createdAt for formatting
        },
      },
      {
        $project: {
          _id: 0,
          category: "$_id.category",
          total_amount: 1,
          periode: {
            $concat: [
              { $dateToString: { format: "%b", date: "$first_created" } }, // Month
              " ",
              { $dateToString: { format: "%Y", date: "$first_created" } }, // Year
            ],
          },
        },
      },
      {
        $sort: { periode: 1, category: 1 }, // Optional: Sort by periode and category
      },
    ]);

    for (let group of monthlyGroup) {
      result.filter((item) => {
        if (item.periode === group.periode) {
          group[`total_${item.category.replaceAll(" ", "").toLowerCase()}`] =
            item.total_amount;
        }
      });

      delete group.year;
      delete group.month;
    }

    res.status(200).json({
      status: true,
      message: "Data retrieved successfully!",
      data: monthlyGroup,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({ status: false, message: error.message, data: null });
  }
};

controller.transactionCategoryYearly = async (req, res, next) => {
  const selectedFieldListData =
    "-menu -user_id -category_id -type_id -wallet_id";
  /*
    #swagger.security = [{
      "bearerAuth": []
    }]
  */
  /*
    #swagger.tags = ['TRANSACTION']
    #swagger.summary = 'user transaction yearly report'
    #swagger.description = 'user transaction yearly report'
    #swagger.parameters['category_name'] = { default: '', description: 'searh by category name' }
    #swagger.parameters['filter'] = { default: '', description: 'filter with 1M 3M 6M 1Y' }
  */
  try {
    const query = {
      ...req.query,
      is_delete: false,
      user_id: req.login.user_id,
    };
    const newQuery = {
      is_delete: false,
      user_id: req.login.user_id,
    };
    const monthlyGroup = await TransactionModel.aggregate([
      { $match: newQuery },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          income: {
            $sum: {
              $cond: [{ $eq: ["$type_name", "income"] }, "$total_amount", 0],
            },
          },
          expense: {
            $sum: {
              $cond: [{ $eq: ["$type_name", "expense"] }, "$total_amount", 0],
            },
          },
          total_category: {
            $sum: {
              $cond: [
                { $eq: ["$category_name", query.category_name] },
                "$total_amount",
                0,
              ],
            },
          },
          // list_data: {
          //   $push: {
          //     _id: "$_id",
          //     total_amount: "$total_amount",
          //     note: "$note",
          //     category_name: "$category_name",
          //     type_name: "$type_name",
          //     date: {
          //       $dateToString: { format: "%d %B %Y", date: "$createdAt" },
          //     },
          //   },
          // },
        },
      },
      {
        $project: {
          _id: 0,
          income: 1,
          expense: 1,
          total_category: 1,
          periode: {
            $dateToString: {
              format: "%B %Y", // Format MM-YYYY (01-2023)
              date: {
                $dateFromParts: {
                  year: "$_id.year",
                  month: "$_id.month",
                  day: 1,
                },
              },
            },
          },
          month: "$_id.month",
          year: "$_id.year",
        },
      },
      {
        $sort: { month: -1, year: -1 },
      },
    ]);

    const listData = await crudServices.findAll(TransactionModel, {
      query,
      selectField: selectedFieldListData,
    });

    for (let month of monthlyGroup) {
      month["list_data"] = listData.data.filter(
        (item) => item.month === month.month,
      );
      delete month.month;
      delete month.year;
    }

    res.status(200).json({
      success: true,
      message: "Data retrieved successfully!",
      data: monthlyGroup,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({ status: false, message: error.message, data: null });
  }
};

controller.transactionCateogryGroup = async (req, res, next) => {
  /*
    #swagger.security = [{
      "bearerAuth": []
    }]
  */
  /*
    #swagger.tags = ['TRANSACTION']
    #swagger.summary = 'user transaction yearly report'
    #swagger.description = 'user transaction yearly report'
    #swagger.parameters['filter'] = { default: '', description: 'filter with 1M 3M 6M 1Y' }
  */
  try {
    const query = { is_delete: false, user_id: req.login.user_id };
    const result = await TransactionModel.aggregate([
      { $match: query },
      {
        $group: {
          _id: "$category_name",
          total_amount: { $sum: "$total_amount" },
          type_name: { $first: "$type_name" }, // Ambil salah satu type_name
          created_at: { $first: "$createdAt" }, // Ambil salah satu type_name
        },
      },
      {
        $project: {
          _id: 0,
          category: "$_id",
          total_amount: 1,
          type_name: 1, // Sekarang type_name adalah string
          created_at: 1,
        },
      },
      {
        $sort: { created_at: 1 },
      },
    ]);

    res.status(200).json({
      success: true,
      message: "Data retrieved successfully!",
      data: result,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({ status: false, message: error.message, data: null });
  }
};

module.exports = controller;
