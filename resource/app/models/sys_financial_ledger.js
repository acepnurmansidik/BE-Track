const mongoose = require("mongoose");
const { model, Schema } = mongoose;

const SysFinancialLedgerSchema = Schema(
  {
    user_id: {
      type: mongoose.Types.ObjectId,
      ref: "sys_user",
      required: true,
    },
    category_id: {
      type: mongoose.Types.ObjectId,
      ref: "sys_refparameter",
      required: true,
    },
    type_id: {
      type: mongoose.Types.ObjectId,
      ref: "sys_refparameter",
      required: true,
    },
    kurs_id: {
      type: mongoose.Types.ObjectId,
      ref: "sys_refparameter",
      required: true,
    },
    bank_id: {
      type: mongoose.Types.ObjectId,
      ref: "sys_wallet",
      required: true,
      default: null,
    },
    amount: {
      type: Number,
      required: [true, "Nominal can't be empty"],
    },
    qty: {
      type: Number,
      default: 1,
      required: [true, "Quantity can't be empty"],
    },
    isIncome: {
      type: Boolean,
      required: [true, "Income type can't be empty"],
    },
    total_amount: {
      type: Number,
      required: [true, "Nominal can't be empty"],
    },
    kurs_amount: {
      type: Number,
      required: [true, "Nominal can't be empty"],
    },
    note: {
      type: String,
      default: "",
    },
  },
  { timestamps: true, versionKey: false, new: true },
);

module.exports = model("sys_financial_ledger", SysFinancialLedgerSchema);
