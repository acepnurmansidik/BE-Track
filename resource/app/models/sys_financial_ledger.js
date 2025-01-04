const mongoose = require("mongoose");
const { model, Schema } = mongoose;

const SysFinancialLedgerSchema = Schema(
  {
    user_id: {
      type: mongoose.Types.ObjectId,
      ref: "sys_user",
      required: true,
    },
    menu: {
      type: String,
      required: true,
      default: "cashflow_trx",
    },
    is_paid: {
      type: Boolean,
      default: false,
    },
    category_id: {
      type: mongoose.Types.ObjectId,
      ref: "sys_refparameter",
      required: true,
    },
    source_id: {
      type: mongoose.Types.ObjectId,
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

SysFinancialLedgerSchema.pre("save", async function (next) {
  // untuk saat ini set kurs nya menjadi 1
  this.kurs_amount = 1;
  this.total_amount = Number(this.amount) * 1;
  if (!this.source_id) {
    this.source_id = this._id;
  }
  next();
});

module.exports = model("sys_financial_ledger", SysFinancialLedgerSchema);
