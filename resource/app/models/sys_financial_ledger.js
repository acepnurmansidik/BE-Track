const mongoose = require("mongoose");
const { model, Schema } = mongoose;

const SysFinancialLedgerSchema = Schema(
  {
    category_id: {
      type: mongoose.Types.ObjectId,
      ref: "sys_refparameter",
      require: true,
    },
    type_id: {
      type: mongoose.Types.ObjectId,
      ref: "sys_refparameter",
      require: true,
    },
    amount: {
      type: Number,
      required: [true, "Nominal tidak boleh kosong"],
    },
    note: {
      type: String,
      minlength: [3, "Panjang password minimal 3 karakter"],
      required: [true, "password harus diisi"],
    },
  },
  { timestamps: true, versionKey: false, new: true },
);

module.exports = model("sys_financial_ledger", SysFinancialLedgerSchema);
