const mongoose = require("mongoose");
const { model, Schema } = mongoose;

const SysProjectSchema = Schema(
  {
    user_id: {
      type: mongoose.Types.ObjectId,
      ref: "sys_user",
      require: true,
      unique: true,
    },
    project_name: {
      type: String,
      require: true,
    },
    url_web_app: {
      type: String,
    },
    url_doc_be: {
      type: String,
      require: true,
    },
    url_download_android_apk: {
      type: String,
      require: true,
    },
    url_download_ios_apk: {
      type: String,
    },
    description: {
      type: String,
      require: true,
    },
    categories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "sys_refparameter",
      },
    ],
    stacks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "sys_refparameter",
      },
    ],
    features: { type: [String], require: true },
    images: { type: [String], require: true },
  },
  { timestamps: true, versionKey: false },
);

module.exports = model("sys_project", SysProjectSchema);
