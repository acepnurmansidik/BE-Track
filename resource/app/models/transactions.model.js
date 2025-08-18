const mongoose = require("mongoose");
const { model, Schema } = mongoose;
const { DateTime } = require("luxon");

const TransactionsSchema = new Schema(
  {
    user_id: {
      type: mongoose.Types.ObjectId,
      ref: "users",
      required: true,
    },
    menu: {
      type: String,
      required: true,
      default: "cashflow",
    },
    is_paid: {
      type: Boolean,
      default: true,
    },
    total_amount: {
      type: Number,
      required: [true, "Nominal can't be empty"],
      default: 0,
    },
    note: {
      type: String,
      default: "",
    },
    category_id: {
      type: mongoose.Types.ObjectId,
      ref: "ReffParameter",
      required: true,
      default: null,
    },
    category_name: {
      type: String,
      default: "Monthly Salary",
    },
    type_id: {
      type: mongoose.Types.ObjectId,
      ref: "ReffParameter",
      required: true,
      default: null,
    },
    type_name: {
      type: String,
      default: "outcome",
    },
    wallet_id: {
      type: mongoose.Types.ObjectId,
      ref: "EWallet",
      required: true,
      default: null,
    },
    is_delete: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    collection: "transactions",
  },
);

// Virtual untuk date (format DD MM YYYY)
TransactionsSchema.virtual("date").get(function () {
  return this.createdAt?.toLocaleString("default", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
});

TransactionsSchema.virtual("month").get(function () {
  return (
    Number(this.createdAt?.toLocaleString("default", { month: "numeric" })) ||
    null
  );
});

// Pastikan virtuals disertakan dalam output
TransactionsSchema.set("toJSON", { virtuals: true });
TransactionsSchema.set("toObject", { virtuals: true });

module.exports = model("Transactions", TransactionsSchema);
