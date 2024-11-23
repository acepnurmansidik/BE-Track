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
      required: [true, "Value harus diisi"],
      unique: true,
    },
    slug: {
      type: String,
      unique: [true, "Project name must be unique"],
      required: true,
    },
    type: {
      type: String,
      required: [true, "password harus diisi"],
    },
    description: {
      type: String,
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
