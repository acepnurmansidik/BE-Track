const SysFinancialLedgerSchema = require("../../models/sys_financial_ledger");
const sys_wallets = require("../../models/sys_wallet");
const SysRefparamSchema = require("../../models/sys_refparam");
const SysBillRunningSchema = require("../../models/sys_bill_running");
const SysUserSchema = require("../../models/sys_users");
const AuthSchema = require("../../models/auth");
const responseAPI = require("../../../utils/response");
const { methodConstant, monthName } = require("../../../utils/constanta");
const { BadRequestError, NotFoundError } = require("../../../utils/errors");
const { DateTime } = require("luxon");
const admin = require("firebase-admin");
const serviceAccount = require("../../../../serviceAccountKey.json");
const { default: mongoose } = require("mongoose");
const { portAccess, puclicIP, urlUltra } = require("../../../utils/config");

const controller = {};

controller.indexWithMonthlyGroup = async (req, res, next) => {
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
  try {
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

    query.user_id = req.login.user_id;

    const [listData, [grand_total]] = await Promise.all([
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
        { $unwind: "$typeDetails" },
        // jika ingin populate dari sub _id tulis kuerinya saja seperti contoh di bawah tidak perlu di push ===
        {
          $lookup: {
            from: "sys_uploadfiles",
            localField: "typeDetails.icon",
            foreignField: "_id",
            as: "typeDetails.icon",
          },
        },
        {
          $unwind: "$typeDetails.icon",
        },
        // =======
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
        // =======
        {
          $lookup: {
            from: "sys_refparameters",
            localField: "kurs_id",
            foreignField: "_id",
            as: "kursDetails",
          },
        },
        { $unwind: "$kursDetails" },
        {
          $lookup: {
            from: "sys_wallets",
            localField: "bank_id",
            foreignField: "_id",
            as: "bankDetails",
          },
        },
        { $unwind: "$bankDetails" },
        // jika ingin populate dari sub _id tulis kuerinya saja seperti contoh di bawah tidak perlu di push ===
        {
          $lookup: {
            from: "sys_uploadfiles",
            localField: "kursDetails.icon",
            foreignField: "_id",
            as: "kursDetails.icon",
          },
        },
        {
          $unwind: "$kursDetails.icon",
        },
        // =======
        {
          $group: {
            _id: {
              $dateToString: { format: "%B %Y", date: "$createdAt" }, // Ganti format
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
                    format: "%Y-%m-%d %H:%M", // Ganti format
                    timezone: "Asia/Jakarta",
                    date: "$createdAt",
                  },
                },
                bank_id: "$bankDetails",
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
              icon: {
                _id: 1,
                name: 1,
                is_active: 1,
                is_cover: 1,
              },
            },
            "items.bank_id": {
              _id: 1,
              wallet_name: 1,
            },
            "items.category_id": {
              _id: 1,
              value: 1,
              description: 1,
              icon: {
                _id: 1,
                name: 1,
                is_active: 1,
                is_cover: 1,
              },
            },
            "items.kurs_id": {
              _id: 1,
              value: 1,
              description: 1,
              icon: {
                _id: 1,
                name: 1,
                is_active: 1,
                is_cover: 1,
              },
            },
          },
        },
        {
          $sort: {
            _id: -1, // Mengurutkan berdasarkan bulan dan tahun
          },
        },
      ]),

      // grand total
      SysFinancialLedgerSchema.aggregate([
        { $match: query },
        {
          $group: {
            _id: null,
            grand_total: { $sum: "$total_amount" }, // Jumlahkan semua total_amount
            current_monthly: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      {
                        $gte: [
                          "$createdAt",
                          DateTime.utc().startOf("month").toJSDate(),
                        ],
                      },
                      {
                        $lte: [
                          "$createdAt",
                          DateTime.utc().endOf("month").toJSDate(),
                        ],
                      },
                    ],
                  },
                  "$total_amount", // Jika dalam rentang bulan ini, tambahkan total_amount
                  0, // Jika tidak, tambahkan 0
                ],
              },
            },
          },
        },
      ]),
    ]);

    // console.log(grand_total);

    const dataResponse = {
      list_data: listData ?? [],
      grand_total: grand_total?.grand_total ? grand_total?.grand_total : 0,
      current_monthly: grand_total?.current_monthly
        ? grand_total?.current_monthly
        : 0,
    };

    responseAPI.MethodResponse({
      res,
      method: methodConstant.GET,
      data: dataResponse,
    });
  } catch (err) {
    next(err);
  }
};

controller.personalDashboard = async (req, res, next) => {
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
    #swagger.parameters['isIncome'] = { default: '', description: 'Search by type', type: 'boolean' }
  */
    const query = req.query;

    if (query.from != "undefined" && query.to != "undefined") {
      query.createdAt = {
        $gte: DateTime.fromJSDate(new Date(query.from), {
          zone: "Asia/Jakarta",
        })
          .setZone("UTC")
          .toISO("UTC"),
        $lte: DateTime.fromJSDate(new Date(query.to), { zone: "Asia/Jakarta" })
          .set({ hour: 23, minute: 59, second: 59, millisecond: 59 })
          .setZone("UTC")
          .toISO("UTC"),
      };
    }

    delete query.from;
    delete query.to;

    if (["undefined", "null"].includes(query.isIncome)) delete query.isIncome;

    const [
      bar_chart_transaction,
      [grand_total],
      dReffZakat,
      dReffSubtractZakat,
      dReffIncome,
      dReffGoldSilver,
      dListIncome,
      dListOutcome,
      list_transactions,
    ] = await Promise.all([
      // query bar_chart_transaction
      SysFinancialLedgerSchema.aggregate([
        {
          $group: {
            _id: {
              $dateToString: { format: "%m %Y", date: "$createdAt" }, // Ganti format
            },
            income: {
              $sum: {
                $cond: [{ $eq: ["$isIncome", true] }, "$total_amount", 0],
              },
            },
            outcome: {
              $sum: {
                $cond: [{ $eq: ["$isIncome", false] }, "$total_amount", 0],
              },
            },
            date: { $first: "$createdAt" },
          },
        },
        {
          $project: {
            _id: 0,
            month: "$_id",
            income: 1,
            outcome: 1,
            date: 1,
          },
        },
        {
          $sort: { date: -1 }, // Mengurutkan hasil berdasarkan date
        },
      ]),

      // query grand_total
      SysFinancialLedgerSchema.aggregate([
        {
          $group: {
            _id: null,
            total_income: {
              $sum: {
                $cond: [{ $eq: ["$isIncome", true] }, "$total_amount", 0],
              },
            },
            total_outcome: {
              $sum: {
                $cond: [{ $eq: ["$isIncome", false] }, "$total_amount", 0],
              },
            },
          },
        },
      ]),

      // query find reffparam zakat
      SysRefparamSchema.findOne({
        value: { $regex: "zakat", $options: "i" },
      })
        .select("_id")
        .lean(),

      // query find data yang dapat mengurangi zakat
      SysRefparamSchema.find({
        is_subtract: true,
      })
        .select("_id")
        .lean(),

      // query income
      SysRefparamSchema.findOne({
        value: { $regex: "income", $options: "i" },
      })
        .select("_id")
        .lean(),

      // query get data emas dan perak
      SysRefparamSchema.findOne({
        is_subtract: true,
        slug: { $regex: "emas-perak", $options: "i" },
      }),

      // list data income
      SysFinancialLedgerSchema.find({
        isIncome: true,
      })
        .select("total_amount createdAt")
        .lean(),

      // list data outcome
      SysFinancialLedgerSchema.find({
        isIncome: false,
      })
        .select("total_amount createdAt")
        .lean(),

      SysFinancialLedgerSchema.find()
        .populate([
          {
            path: "category_id",
            select: "_id value icon",
          },
          {
            path: "type_id",
            select: "_id value icon",
          },
        ])
        .select("-updatedAt -isIncome -amount -kurs_amount"),
    ]);

    // BAR * CHART * SECTION ################################################################################
    // modifikasi result dari DB mnejadi nama bulan dan tahun/MMMM YYYY
    bar_chart_transaction.map((everyItem) => {
      everyItem.month = `${
        monthName[Number(everyItem.month.split(" ")[0]) - 1]
      } ${everyItem.month.split(" ")[1]}`;
    });

    // ZAKAT * SECTION ######################################################################################
    const _dZakatIncome = [];
    const dateNow = DateTime.now();

    // PENGHASILAN ==========================================================================================
    // get data setup zakat pertahunnya dari penghasilan
    const dSetZakatPenghasilan = await SysBillRunningSchema.find({
      category_id: dReffZakat._id,
    })
      .sort({ due_date: 1 })
      .lean();
    const _tempdReffSubtractZakat = dReffSubtractZakat.map((item) => item._id);

    // lakukan looping untuk melakukan perhitungan zakat berapa zakat pertahunnya
    for (let index = 0; index < dSetZakatPenghasilan.length; index++) {
      // set tanggal awal
      const tanggalAwal = DateTime.fromISO(
        new Date(dSetZakatPenghasilan[index].due_date).toISOString(),
        {
          zone: "Asia/Jakarta",
        },
      );

      // set tanggal akhir
      let tanggalAkhir;
      if (index === dSetZakatPenghasilan.length - 1) {
        tanggalAkhir = tanggalAwal.plus({ year: 1 });
      } else {
        tanggalAkhir = DateTime.fromISO(
          new Date(dSetZakatPenghasilan[index + 1].due_date).toISOString(),
          {
            zone: "Asia/Jakarta",
          },
        );
      }

      // # cari data di finance berdasarkan filter tanggal
      // cari data penghasilan dan pnegurang dari data di finance yang dipakia untuk zakat
      let [dPenghasilan, dPengurang, dEmasPerak] = await Promise.all([
        // get data penghasilan zakat pertahun
        SysFinancialLedgerSchema.aggregate([
          {
            $match: {
              createdAt: {
                $gte: tanggalAwal.toJSDate(),
                $lte: tanggalAkhir.toJSDate(),
              },
              type_id: dReffIncome._id,
            },
          },
          {
            $group: {
              _id: null,
              total_amount: { $sum: "$total_amount" },
            },
          },
        ]),

        // get data pengurang zakat pertahun
        SysFinancialLedgerSchema.aggregate([
          {
            $match: {
              createdAt: {
                $gte: tanggalAwal.toJSDate(),
                $lte: tanggalAkhir.toJSDate(),
              },
              category_id: {
                $in: _tempdReffSubtractZakat,
              },
            },
          },
          {
            $group: {
              _id: null,
              total_amount: { $sum: "$total_amount" },
            },
          },
          {
            $project: {
              total_amount: { $ifNull: ["$total_amount", 0] }, // Jika total_amount null, set ke 0
            },
          },
        ]),

        // get data pengurang zakat pertahun berupda emas dan perak
        SysFinancialLedgerSchema.aggregate([
          {
            $match: {
              createdAt: {
                $gte: tanggalAwal.toJSDate(),
                $lte: tanggalAkhir.toJSDate(),
              },
              category_id: dReffGoldSilver._id,
            },
          },
          {
            $group: {
              _id: null,
              total_amount: { $sum: "$total_amount" },
              total_qty: { $sum: "$qty" },
            },
          },
          {
            $project: {
              total_amount: { $ifNull: ["$total_amount", 0] }, // Jika total_amount null, set ke 0
            },
          },
        ]),
      ]);

      if (!dPenghasilan.length) dPenghasilan.push({ total_amount: 0 });
      if (!dPengurang.length) dPengurang.push({ total_amount: 0 });
      if (!dEmasPerak.length) dEmasPerak.push({ total_amount: 0 });

      // lalu hitung zakatnya (2.4% dari penghasilan dikurangi pengurang)
      const otherSubtract = dEmasPerak[0].total_amount;
      const totalZakat =
        2.5 *
        (dPenghasilan[0].total_amount -
          (dPengurang[0].total_amount - otherSubtract));

      // kemudian data zakat penghasilannya di masukan ke dalam array
      _dZakatIncome.push({
        _id: dSetZakatPenghasilan[index]._id,
        total_amount: totalZakat,
        createdAt: dSetZakatPenghasilan[index].createdAt,
        year: tanggalAwal.toFormat("LLL yyyy"),
      });
    }

    // EMAS DAN PERAK ==========================================================================================
    const [[dZakatEmasPerak], [gradTotalEmasPerak]] = await Promise.all([
      // get data transaksi berupa emas dan perak yang dimana lebih dari satu tahun
      SysFinancialLedgerSchema.aggregate([
        {
          $match: {
            category_id: dReffGoldSilver._id,
            createdAt: {
              $lte: dateNow.minus({ year: 1 }).toJSDate(),
            },
          },
        },
        {
          $group: {
            _id: null,
            total_amount: { $sum: "$total_amount" },
            total_qty: { $sum: "$qty" },
          },
        },
      ]),

      // get data transaksi total emas dan perak secara keseluran
      SysFinancialLedgerSchema.aggregate([
        {
          $match: {
            category_id: dReffGoldSilver._id,
          },
        },
        {
          $group: {
            _id: null,
            total_amount: { $sum: "$total_amount" },
            total_qty: { $sum: "$qty" },
          },
        },
      ]),
    ]);

    const nominalZakatGoldSilver =
      dZakatEmasPerak.total_qty >= 85 ? dZakatEmasPerak.total_amount : 0;

    // GET LIST DATA ==============================================
    const [dListGoldSilver, dTotalIncomeOutcome] = await Promise.all([
      // list data emas dan perak
      SysFinancialLedgerSchema.find({
        category_id: dReffGoldSilver._id,
      })
        .select("total_amount createdAt")
        .lean(),

      // get total data income dan outcome bulan ini
      SysFinancialLedgerSchema.aggregate([
        {
          $match: {
            createdAt: {
              $gte: DateTime.now().startOf("month").toJSDate(),
              $lte: DateTime.now().endOf("month").toJSDate(),
            },
          },
        },
        {
          $group: {
            _id: null,
            income: {
              $sum: {
                $cond: [{ $eq: ["$isIncome", true] }, "$total_amount", 0],
              },
            },
            outcome: {
              $sum: {
                $cond: [{ $eq: ["$isIncome", false] }, "$total_amount", 0],
              },
            },
            gold_silver: {
              $sum: {
                $cond: [
                  { $eq: ["$category_id", dReffGoldSilver._id] },
                  "$total_amount",
                  0,
                ],
              },
            },
          },
        },
      ]),
    ]);

    responseAPI.MethodResponse({
      res,
      method: methodConstant.GET,
      data: {
        list_transactions,
        bar_chart_transaction,
        total_gold_silver: {
          total_month: dTotalIncomeOutcome.gold_silver,
          grand_total: gradTotalEmasPerak.total_amount,
          total_qty: gradTotalEmasPerak.total_qty - dZakatEmasPerak.total_qty,
          grand_total_qty: gradTotalEmasPerak.total_qty,
          total_left_amount: 0,
          list_data: dListGoldSilver,
        },
        total_income: {
          total_month: dTotalIncomeOutcome.income,
          grand_total: grand_total.total_income,
          total_qty: 0,
          grand_total_qty: 0,
          total_left_amount: 0,
          list_data: dListIncome,
        },
        total_outcome: {
          total_month: dTotalIncomeOutcome.outcome,
          grand_total: grand_total.total_outcome,
          total_qty: 0,
          grand_total_qty: 0,
          total_left_amount: 0,
          list_data: dListOutcome,
        },
        total_zakat: {
          penghasilan: {
            total_month: _dZakatIncome[0].total_amount,
            grand_total: _dZakatIncome[0].total_amount,
            total_qty: 0,
            grand_total_qty: 0,
            total_left_amount: ![undefined, null].includes(
              _dZakatIncome[1]?.total_zakat,
            )
              ? _dZakatIncome[1].total_zakat
              : 0,
            list_data: _dZakatIncome,
          },
          gold_silver: {
            total_month: nominalZakatGoldSilver,
            grand_total: gradTotalEmasPerak.total_amount,
            grand_total: nominalZakatGoldSilver,
            total_qty: gradTotalEmasPerak.total_qty - dZakatEmasPerak.total_qty,
            grand_total_qty: dZakatEmasPerak.total_qty,
            total_left_amount: 0,
            list_data: dListGoldSilver,
          },
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

controller.create = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
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
    payload.user_id = req.login.user_id;
    let payloadWallets = {};

    const [typeRef, categoryRef, kurs] = await Promise.all([
      SysRefparamSchema.findOne({ _id: payload.type_id }),
      SysRefparamSchema.findOne({ _id: payload.category_id }),
      SysRefparamSchema.findOne({ slug: "idr" }),
    ]);

    if (typeRef._id.toString() != categoryRef.parent_id.toString()) {
      throw new BadRequestError("Category no match!");
    }

    // untuk sekarang mata uangnya di hardcode terlebih dahulu
    payload.kurs_id = kurs._id;
    // cek jika kursnya menggunakan IDR/tidak mengirimka kurs
    if (!payload.kurs_amount) payload.kurs_amount = 1;
    payload.total_amount = payload.amount * payload.kurs_amount;

    if (typeRef.value.toLowerCase() == "income") {
      payload.isIncome = true;
      payloadWallets = { $inc: { amount: payload.total_amount } };
    } else {
      payload.isIncome = false;
      payloadWallets = { $inc: { amount: -payload.total_amount } };
    }

    const [dataCreateFinanceTrx] = await Promise.all([
      SysFinancialLedgerSchema.create([payload], { session }),
      sys_wallets.findOneAndUpdate({ _id: payload.bank_id }, payloadWallets, {
        session,
      }),
    ]);

    // admin.initializeApp({
    //   credential: admin.credential.cert(serviceAccount),
    // });

    await session.commitTransaction();

    responseAPI.MethodResponse({
      res,
      method: methodConstant.POST,
      data: dataCreateFinanceTrx,
    });
  } catch (err) {
    await session.abortTransaction();
    next(err);
  } finally {
    await session.endSession();
  }
};

controller.update = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
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

    const [typeRef, categoryRef, kurs, leftDataTrx, dataWallet] =
      await Promise.all([
        SysRefparamSchema.findOne({ _id: payload.type_id }).lean(),
        SysRefparamSchema.findOne({ _id: payload.category_id }).lean(),
        SysRefparamSchema.findOne({ slug: "idr" }).lean(),
        SysFinancialLedgerSchema.findOne({ _id })
          .select("total_amount type_id")
          .populate("type_id")
          .lean(),
        sys_wallets.findOne({ _id: payload.bank_id }).select("amount").lean(),
      ]);

    if (typeRef._id.toString() != categoryRef.parent_id.toString()) {
      throw new BadRequestError("Category no match!");
    }

    if (
      typeRef.value.toLowerCase() == "income" &&
      leftDataTrx.type_id.value == "income"
    ) {
      payload.isIncome = true;
      dataWallet.amount =
        Number(payload.amount) + (dataWallet.amount - leftDataTrx.total_amount);
    } else if (
      typeRef.value.toLowerCase() == "outcome" &&
      leftDataTrx.type_id.value == "income"
    ) {
      payload.isIncome = false;
      dataWallet.amount =
        dataWallet.amount - (leftDataTrx.total_amount + Number(payload.amount));
    } else if (
      typeRef.value.toLowerCase() == "outcome" &&
      leftDataTrx.type_id.value == "outcome"
    ) {
      dataWallet.amount =
        dataWallet.amount + leftDataTrx.total_amount - Number(payload.amount);
    } else if (
      typeRef.value.toLowerCase() == "income" &&
      leftDataTrx.type_id.value == "outcome"
    ) {
      dataWallet.amount = dataWallet.amount + Number(payload.amount);
    }

    // untuk sekarang mata uangnya di hardcode terlebih dahulu
    payload.kurs_id = kurs._id;
    // cek jika kursnya menggunakan IDR/tidak mengirimka kurs
    if (!payload.kurs_amount) payload.kurs_amount = 1;
    payload.total_amount = Number(payload.amount) * 1;

    await Promise.all([
      SysFinancialLedgerSchema.findOneAndUpdate({ _id }, payload, { session }),
      sys_wallets.findOneAndUpdate(
        { _id: payload.bank_id },
        { amount: dataWallet.amount },
        { session },
      ),
    ]);

    await session.commitTransaction();

    responseAPI.MethodResponse({
      res,
      method: methodConstant.PUT,
      data: null,
    });
  } catch (err) {
    await session.abortTransaction();
    next();
  } finally {
    await session.endSession();
  }
};

controller.delete = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
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

    // ambil data sebelumnya
    const isExist = await SysFinancialLedgerSchema.findOne({ _id });

    // cek jika datanya ada
    if (!isExist) throw new NotFoundError(`Data with id: ${_id} not found`);

    // jika data yang dihapus adalah income maka kurangi total amount dari wallet namu jika sebaliknya maka tambahkan
    if (isExist.isIncome) {
      await sys_wallets.findOneAndUpdate(
        { _id: isExist.bank_id },
        { $inc: { amount: -isExist.amount } },
        { session },
      );
    } else {
      await sys_wallets.findOneAndUpdate(
        { _id: isExist.bank_id },
        { $inc: { amount: isExist.amount } },
        { session },
      );
    }

    // hapus data
    await SysFinancialLedgerSchema.findOneAndDelete({ _id }, { session });

    await session.commitTransaction();
    responseAPI.MethodResponse({
      res,
      method: methodConstant.DELETE,
      data: null,
    });
  } catch (err) {
    await session.abortTransaction();
    next();
  } finally {
    await session.endSession();
  }
};

controller.categoryActivity = async (req, res, next) => {
  /*
    #swagger.security = [{
      "bearerAuth": []
    }]
  */
  /*
    #swagger.tags = ['FINANCE']
    #swagger.summary = 'category activity'
    #swagger.description = 'get data transaction yang dikelompokan ke dalam setiap kategorinya'
    #swagger.parameters['type_id'] = { default: '', description: 'Search by type id', type: 'string' }
    #swagger.parameters['bank_id'] = { default: '', description: 'Search by bank id', type: 'string' }
  */
  try {
    // filter data
    const queryFilter = {};
    Object.keys(req.query).map((item) => {
      if (item.includes("_id")) {
        queryFilter[item] = new mongoose.Types.ObjectId(`${req.query[item]}`);
      } else {
        queryFilter[item] = req.query[item];
      }
    });

    // filter data with user login
    queryFilter.user_id = req.login.user_id;

    // mendapatkan tahun sekarang
    const currentYear = DateTime.now().year;

    // mendapatkan tanggal dan bulan pertaman id tahun sekarang
    const firstDayOfYear = DateTime.fromObject({
      year: currentYear,
      month: 1,
      day: 1,
    }).toJSDate();
    const lastDayOfYear = DateTime.fromObject({
      year: currentYear,
      month: 12,
      day: 31,
      hour: 23,
      minute: 59,
      second: 59,
      millisecond: 999,
    }).toJSDate();

    // get data from database
    const [list_data, data_chart, grand_total_left, grand_total] =
      await Promise.all([
        // Data item
        SysFinancialLedgerSchema.aggregate([
          {
            $match: queryFilter,
          },
          {
            $lookup: {
              from: "sys_refparameters",
              localField: "category_id",
              foreignField: "_id",
              as: "categoryDetails",
            },
          },
          { $unwind: "$categoryDetails" },
          {
            $lookup: {
              from: "sys_uploadfiles",
              localField: "categoryDetails.icon",
              foreignField: "_id",
              as: "categoryDetails.icon",
            },
          },
          { $unwind: "$categoryDetails.icon" },
          {
            $group: {
              _id: "$categoryDetails._id",
              name: { $first: "$categoryDetails.value" },
              image_url: { $first: "$categoryDetails.icon.name" },
              total_category: { $sum: "$total_amount" },
              total_count: { $sum: 1 },
            },
          },
          {
            $project: {
              _id: 1,
              total_category: 1,
              name: 1,
              total_count: 1,
              image_url: {
                $concat: [`${urlUltra}`, "$image_url"],
              },
            },
          },
        ]),

        // query chart_transaction
        SysFinancialLedgerSchema.aggregate([
          {
            $match: {
              createdAt: { $gte: firstDayOfYear, $lte: lastDayOfYear },
              ...queryFilter,
            },
          },
          {
            $group: {
              _id: {
                $dateToString: { format: "%m %Y", date: "$createdAt" }, // Ganti format
              },
              date: { $first: "$createdAt" },
              income: {
                $sum: {
                  $cond: [{ $eq: ["$isIncome", true] }, "$total_amount", 0],
                },
              },
              outcome: {
                $sum: {
                  $cond: [{ $eq: ["$isIncome", false] }, "$total_amount", 0],
                },
              },
            },
          },
          {
            $project: {
              _id: 0,
              month: "$_id",
              income: 1,
              outcome: 1,
              date: 1,
            },
          },
          {
            $sort: { date: -1 }, // Mengurutkan hasil berdasarkan date
          },
        ]),

        // query grand_total left
        SysFinancialLedgerSchema.aggregate([
          {
            $match: {
              createdAt: {
                $gte: DateTime.fromObject({
                  year: currentYear - 1,
                  month: 1,
                  day: 1,
                }).toJSDate(),
                $lte: DateTime.fromObject({
                  year: currentYear - 1,
                  month: 12,
                  day: 31,
                  hour: 23,
                  minute: 59,
                  second: 59,
                  millisecond: 999,
                }).toJSDate(),
              },
              ...queryFilter,
            },
          },
          {
            $group: {
              _id: null,
              total_income: {
                $sum: {
                  $cond: [{ $eq: ["$isIncome", true] }, "$total_amount", 0],
                },
              },
              total_outcome: {
                $sum: {
                  $cond: [{ $eq: ["$isIncome", false] }, "$total_amount", 0],
                },
              },
            },
          },
        ]),

        // query grand_total
        SysFinancialLedgerSchema.aggregate([
          {
            $match: {
              createdAt: { $gte: firstDayOfYear, $lte: lastDayOfYear },
              ...queryFilter,
            },
          },
          {
            $group: {
              _id: null,
              total_income: {
                $sum: {
                  $cond: [{ $eq: ["$isIncome", true] }, "$total_amount", 0],
                },
              },
              total_outcome: {
                $sum: {
                  $cond: [{ $eq: ["$isIncome", false] }, "$total_amount", 0],
                },
              },
            },
          },
        ]),
      ]);

    // BAR * CHART * SECTION ################################################################################
    // modifikasi result dari DB mnejadi nama bulan dan tahun/MMMM YYYY
    data_chart.map((everyItem) => {
      everyItem.month = `${
        monthName[Number(everyItem.month.split(" ")[0]) - 1]
      } ${everyItem.month.split(" ")[1]}`;
    });

    const income = {
      total_amount: grand_total[0]?.total_income ?? 0,
      percentage: "~",
      status: "stable",
    };
    const outcome = {
      total_amount: grand_total[0]?.total_outcome ?? 0,
      percentage: "~",
      status: "stable",
    };

    if (grand_total[0]?.total_income > grand_total_left[0]?.total_income) {
      income.percentage = `+${(
        grand_total[0]?.total_income / grand_total_left[0]?.total_income
      ).toFixed(2)} %`;
      income.status = "up";
    } else if (
      grand_total[0]?.total_income < grand_total_left[0]?.total_income
    ) {
      income.status = "down";
      income.percentage =
        "-" +
        (
          grand_total_left[0]?.total_income / grand_total[0]?.total_income
        ).toFixed(2) +
        " %";
    }

    if (grand_total[0]?.total_outcome < grand_total_left[0]?.total_outcome) {
      outcome.status = "up";
      outcome.percentage =
        "+" +
        (
          grand_total_left[0]?.total_outcome / grand_total[0]?.total_outcome
        ).toFixed(2) +
        " %";
    } else if (
      grand_total[0]?.total_outcome > grand_total_left[0]?.total_outcome
    ) {
      outcome.status = "down";
      outcome.percentage =
        "-" +
        (
          grand_total[0]?.total_outcome / grand_total_left[0]?.total_outcome
        ).toFixed(2) +
        " %";
    }

    // send response to client
    responseAPI.MethodResponse({
      res,
      method: methodConstant.GET,
      data: {
        list_data,
        data_chart,
        income,
        outcome,
      },
    });
  } catch (err) {
    next(err);
  }
};

// =====================================================================================
// BILL RUNNING =========================================================================
controller.indexBillRunning = async (req, res, next) => {
  try {
    /*
    #swagger.security = [{
      "bearerAuth": []
    }]
  */
    /*
    #swagger.tags = ['TAGIHAN/BILL']
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

    const result = await SysBillRunningSchema.find().populate([
      {
        path: "category_id",
        select: "_id value type",
      },
      {
        path: "type_id",
        select: "_id value type",
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

controller.createBillRunning = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    /*
    #swagger.security = [{
      "bearerAuth": []
    }]
  */
    /*
    #swagger.tags = ['TAGIHAN/BILL']
    #swagger.summary = 'ref parameter'
    #swagger.description = 'untuk referensi group'
    #swagger.parameters['obj'] = {
      in: 'body',
      description: 'Create role',
      schema: { $ref: '#/definitions/BodyBillRunningSchema' }
    }
  */
    const payload = req.body;

    // check reffparameter
    const [categoryExist, TypeExist] = await Promise.all([
      SysRefparamSchema.findOne({ _id: payload.category_id }),
      SysRefparamSchema.findOne({ _id: payload.type_id }),
    ]);

    if (!categoryExist)
      throw new NotFoundError(
        `Refference category with id : ${payload.category_id} not found!`,
      );
    if (!TypeExist)
      throw new NotFoundError(
        `Refference type with id : ${payload.category_id} not found!`,
      );

    const setDate = DateTime.fromISO(payload.due_date);
    const toNDate = DateTime.fromISO(payload.date_reminder);

    // cek jika salah pengingat waktu nye melebihi tanggal yang di tentukan
    if (toNDate > setDate)
      throw new BadRequestError("Reminder must be less than set date!");

    // insert to database
    await SysBillRunningSchema.create([payload], { session });

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

controller.putBillRunning = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    /*
    #swagger.security = [{
      "bearerAuth": []
    }]
  */
    /*
    #swagger.tags = ['TAGIHAN/BILL']
    #swagger.summary = 'ref parameter'
    #swagger.description = 'untuk referensi group'
    #swagger.parameters['obj'] = {
      in: 'body',
      description: 'Create role',
      schema: { $ref: '#/definitions/BodyBillRunningSchema' }
    }
  */
    const payload = req.body;
    const _id = req.params.id;

    // check reffparameter
    const [billExis, categoryExist, TypeExist] = await Promise.all([
      SysBillRunningSchema.findOne({ _id }),
      SysRefparamSchema.findOne({ _id: payload.category_id }),
      SysRefparamSchema.findOne({ _id: payload.type_id }),
    ]);

    // send response not found when data not available in database
    if (!billExis) throw new NotFoundError(`Data with id : ${_id} not found!`);

    // send response not found when data not available in database
    if (!categoryExist)
      throw new NotFoundError(
        `Refference category with id : ${payload.category_id} not found!`,
      );

    // send response not found when data not available in database
    if (!TypeExist)
      throw new NotFoundError(
        `Refference type with id : ${payload.category_id} not found!`,
      );

    // insert to database
    await SysBillRunningSchema.findOneAndUpdate({ _id }, payload, { session });

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

controller.deleteBillRunning = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    /*
    #swagger.security = [{
      "bearerAuth": []
    }]
  */
    /*
    #swagger.tags = ['TAGIHAN/BILL']
    #swagger.summary = 'ref parameter'
    #swagger.description = 'untuk referensi group'
  */
    const _id = req.params.id;

    // check reffparameter
    const billExis = await SysBillRunningSchema.findOne({ _id });

    // send response not found when data not available in database
    if (!billExis) throw new NotFoundError(`Data with id : ${_id} not found!`);

    // insert to database
    await SysBillRunningSchema.findOneAndDelete({ _id }, { session });

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

module.exports = controller;
