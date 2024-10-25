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
    major_id: {
      type: mongoose.Types.ObjectId,
      ref: "sys_refparameter",
      required: true,
    },
    school_name: {
      type: String,
      minlength: [3, "Panjang nama sekolah minimal 3 karakter"],
    },
    start_date: {
      type: Date,
    },
    end_date: {
      type: Date,
    },
  },
  { timestamps: true, versionKey: false },
);

module.exports = model("sys_trx_education", SysTrxEducationSchema);
