const mongoose = require("mongoose");
const { model, Schema } = mongoose;

const SysBillRunningSchema = Schema(
  {
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
    due_date: {
      type: Date,
      required: [true, "Due date can't be empty"],
    },
    amount: {
      type: Number,
      default: 0,
      required: [true, "Nominal can't be empty"],
    },
    date_reminder: {
      type: Date,
      required: [true, "Date reminder can't be empty"],
    },
    note: {
      type: String,
      minlength: [3, "The note must be at least 3 characters"],
      required: [true, "The note can't be empty"],
    },
  },
  { timestamps: true, versionKey: false, new: true },
);

module.exports = model("sys_bill_running", SysBillRunningSchema);
