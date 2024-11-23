const mongoose = require("mongoose");
const { model, Schema } = mongoose;

const SysRefparamSchema = Schema(
  {
    key: {
      type: Number,
    },
    value: {
      type: String,
      minlength: [1, "Panjang minimal 3 karakter"],
      maxLength: [20, "Panjang maksimal 20 karakter"],
      required: [true, "Value harus diisi"],
      unique: true,
    },
    type: {
      type: String,
      minlength: [3, "Panjang password minimal 3 karakter"],
      required: [true, "password harus diisi"],
    },
    description: {
      type: String,
      minlength: [3, "Panjang password minimal 3 karakter"],
      default: "",
    },
    icon: {
      type: mongoose.Types.ObjectId,
      ref: "sys_uploadfile",
      default: null,
    },
  },
  { timestamps: true, versionKey: false, new: true },
);

module.exports = model("sys_refparameter", SysRefparamSchema);
