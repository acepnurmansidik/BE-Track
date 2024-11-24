const mongoose = require("mongoose");
const { model, Schema } = mongoose;

const SysUserSchema = Schema(
  {
    auth_id: {
      type: mongoose.Types.ObjectId,
      ref: "sys_auth_user",
      required: true,
      unique: true,
    },
    gender_id: {
      type: mongoose.Types.ObjectId,
      ref: "sys_refparameter",
    },
    role_id: {
      type: mongoose.Types.ObjectId,
      ref: "sys_refparameter",
    },
    status_id: {
      type: mongoose.Types.ObjectId,
      ref: "sys_refparameter",
    },
    skills: [
      {
        type: mongoose.Types.ObjectId,
        ref: "sys_refparameter",
      },
    ],
    name: {
      type: String,
      required: [true, "Name can't be empty"],
    },
    personal_desc: {
      type: String,
    },
    device_token: {
      type: String,
    },
    address: {
      type: String,
      required: [false, "Name can't be empty"],
      default: "",
    },
    tagline: {
      type: String,
      default: "",
    },
    birth_date: {
      type: String,
    },
    description: {
      type: String,
      default: "",
    },
    web_url: {
      type: String,
      default: "",
    },
    github_url: {
      type: String,
      default: "",
    },
    phone_number: {
      type: String,
      default: "",
    },
    instagram_url: {
      type: String,
      default: "",
    },
    linkedin_url: {
      type: String,
      default: "",
    },
    facebook_url: {
      type: String,
      default: "",
    },
  },
  { timestamps: true, versionKey: false, new: true },
);

module.exports = model("sys_user", SysUserSchema);
