const mongoose = require("mongoose");
const { model, Schema } = mongoose;

const SysTrxEducationSchema = Schema(
  {
    key: {
      type: Number,
      required: true,
    },
    user_id: {
      type: mongoose.Types.ObjectId,
      ref: "sys_auth_user",
      required: true,
    },
    degree_name: {
      type: String,
      default: null,
      minlength: [2, "The school name must be at least 2 characters"],
      required: true,
    },
    school_name: {
      type: String,
      minlength: [5, "The school name must be at least 5 characters"],
      required: true,
    },
    start_date: {
      type: Date,
      required: true,
    },
    end_date: {
      type: Date,
    },
  },
  { timestamps: true, versionKey: false, new: true },
);

module.exports = model("sys_trx_education", SysTrxEducationSchema);
