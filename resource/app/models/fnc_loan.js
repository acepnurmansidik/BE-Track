const { Schema, model, default: mongoose } = require("mongoose");

const FncLoanSchema = Schema(
  {
    user_id: {
      type: mongoose.Types.ObjectId,
      ref: "sys_user",
      required: true,
    },
    title: {
      type: String,
      default: "Loan",
      required: true,
    },
    status_paid: {
      type: Boolean,
      default: false,
    },
    is_income: {
      type: Boolean,
      default: false,
    },
    from_name: {
      type: String,
      default: "You",
      required: true,
    },
    to_name: {
      type: String,
      default: "",
      required: true,
    },
    note: {
      type: String,
      default: "",
      required: true,
    },
    due_date: {
      type: Date,
      default: null,
    },
    nominal: {
      type: Number,
      default: 0,
      required: true,
    },
  },
  { timestamps: true, versionKey: false, new: true },
);

module.exports = model("fnc_loan", FncLoanSchema); //export model
