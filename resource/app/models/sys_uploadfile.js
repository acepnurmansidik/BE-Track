const mongoose = require("mongoose");
const { model, Schema } = mongoose;

const SysUploadFileSchema = Schema(
  {
    is_cover: {
      type: Boolean,
      required: true,
      default: false,
    },
    is_active: {
      type: Boolean,
      required: true,
      default: false,
    },
    name: {
      type: String,
      require: true,
    },
  },
  { timestamps: true, versionKey: false },
);
module.exports = model("sys_uploadfile", SysUploadFileSchema);
