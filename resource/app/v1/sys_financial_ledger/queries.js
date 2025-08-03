const { DateTime } = require("luxon");

exports.queryTransactionMontylyGroup = [
  {
    $group: {
      _id: {
        $dateToString: { format: "%B %Y", date: "$createdAt" }, // Ganti format
      },
    },
  },
  {
    $project: {
      _id: 0,
      periode: "$_id",
    },
  },
  {
    $sort: { _id: 1 },
  },
];

exports.queryGrandTotalTrx = [
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
];

exports.queryMontlyNameGroup = [
  {
    $group: {
      _id: {
        $dateToString: { format: "%B %Y", date: "$createdAt" }, // Ganti format
      },
    },
  },
  {
    $project: {
      _id: 0,
      periode: "$_id",
      items: { $literal: [] },
      total_monthly: { $literal: 0 },
    },
  },
  {
    $sort: { periode: 1 },
  },
];
