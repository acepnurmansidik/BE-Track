const mongoose = require("mongoose");
const { model, Schema } = mongoose;

const SysTrxExperienceSchema = Schema(
  {
    key: {
      type: Number,
      required: true,
    },
    user_id: {
      type: mongoose.Types.ObjectId,
      ref: "sys_auth_user",
      required: true,
      unique: true,
    },
    role_id: {
      type: mongoose.Types.ObjectId,
      ref: "sys_refparameter",
      required: true,
      unique: true,
    },
    stacks: [
      {
        _id: {
          type: mongoose.Types.ObjectId,
          ref: "sys_refparameter",
          required: true,
        },
        name: {
          type: String,
          minlength: [3, "Nama 3 karakter"],
          required: [true, "Nama wajib diisi!"],
        },
        icon: {
          type: String,
          minlength: [3, "Nama 3 karakter"],
          required: [true, "Nama wajib diisi!"],
        },
      },
    ],
    product_name: {
      type: String,
      minlength: [3, "Nama product 3 karakter"],
      required: [true, "Nama sekolah wajib diisi!"],
    },
    achievment_list: {
      type: String,
      minlength: [3, "Nama product 3 karakter"],
      required: [true, "Nama sekolah wajib diisi!"],
    },
    company_name: {
      type: String,
      minlength: [3, "Nama perusahaan minimal 3 karakter"],
      required: [true, "Nama sekolah wajib diisi!"],
    },
    start_date: {
      type: Date,
      required: [true, "Tanggal masuk wajib diisi!"],
    },
    end_date: {
      type: Date,
      required: [true, "Tanggal kelulusan wajib diisi!"],
    },
  },
  { timestamps: true, versionKey: false },
);

module.exports = model("sys_trx_experience", SysTrxExperienceSchema);
