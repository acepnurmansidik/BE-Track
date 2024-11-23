const mongoose = require("mongoose");
const { model, Schema } = mongoose;

const SysUploadFileSchema = require("./sys_uploadfile.js");

const SysProjectSchema = new Schema(
  {
    user_id: {
      type: mongoose.Types.ObjectId,
      ref: "sys_user",
      // required: true, // Uncomment if user_id is mandatory
    },
    project_name: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      unique: [true, "Project name must be unique"],
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
    features: {
      type: [String],
      required: true,
    },
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
    contributes: [
      {
        contribute_name: {
          type: String,
          required: true,
        },
        github_link: {
          type: String,
          default: "",
        },
        linked_link: {
          type: String,
          default: "",
        },
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
