const mongoose = require("mongoose");
const { model, Schema } = mongoose;

const SysUserSchema = Schema(
  {
    auth_id: {
      type: mongoose.Types.ObjectId,
      ref: "sys_auth_user",
      require: true,
      unique: true,
    },
    name: {
      type: String,
      minlength: [3, "Panjang name minimal 3 karakter"],
      required: [true, "Name can't be empty"],
    },
    device_token: {
      type: String,
      minlength: [3, "Panjang password minimal 3 karakter"],
      required: [true, "Device token can't be empty"],
    },
  },
  { timestamps: true, versionKey: false, new: true },
);

module.exports = model("sys_user", SysUserSchema);
