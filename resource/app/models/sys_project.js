const mongoose = require("mongoose");
const { model, Schema } = mongoose;
const SysUploadFileSchema = require("./sys_uploadfile.js");

const SysProjectSchema = Schema(
  {
    user_id: {
      type: mongoose.Types.ObjectId,
      ref: "sys_user",
      // required: true,
    },
    project_name: {
      type: String,
      required: true,
    },
    url_web_app: {
      type: String,
    },
    url_doc_be: {
      type: String,
      required: true,
    },
    url_download_android_apk: {
      type: String,
      required: true,
    },
    url_download_ios_apk: {
      type: String,
    },
    description: {
      type: String,
      required: true,
    },
    features: { type: [String], required: true },
    status_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "sys_refparameter",
      required: true,
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
    images: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "sys_uploadfile",
      },
    ],
  },
  { timestamps: true, versionKey: false },
);

module.exports = model("sys_project", SysProjectSchema);
