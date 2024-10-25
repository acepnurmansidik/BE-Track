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
    gender_id: {
      type: mongoose.Types.ObjectId,
      ref: "sys_refparameter",
      require: true,
    },
    role_id: {
      type: mongoose.Types.ObjectId,
      ref: "sys_refparameter",
      require: true,
    },
    status_id: {
      type: mongoose.Types.ObjectId,
      ref: "sys_refparameter",
      require: true,
    },
    name: {
      type: String,
      minlength: [3, "Panjang name minimal 3 karakter"],
      required: [true, "Name can't be empty"],
    },
    device_token: {
      type: String,
      minlength: [3, "Panjang password minimal 3 karakter"],
      required: [false, "Device token can't be empty"],
    },
    address: {
      type: String,
      minlength: [10, "Panjang name minimal 3 karakter"],
    },
    tagline: {
      type: String,
      minlength: [7, "Panjang name minimal 3 karakter"],
    },
    birth_date: {
      type: Date,
    },
    description: {
      type: String,
      minlength: [3, "Panjang name minimal 3 karakter"],
    },
    web_url: {
      type: String,
      minlength: [3, "Panjang name minimal 3 karakter"],
    },
    github_url: {
      type: String,
      minlength: [3, "Panjang name minimal 3 karakter"],
    },
    phone_number: {
      type: String,
      minlength: [3, "Panjang name minimal 3 karakter"],
    },
    instagram_url: {
      type: String,
      minlength: [3, "Panjang name minimal 3 karakter"],
    },
    linkedin_url: {
      type: String,
      minlength: [3, "Panjang name minimal 3 karakter"],
    },
    facebook_url: {
      type: String,
      minlength: [3, "Panjang name minimal 3 karakter"],
    },
  },
  { timestamps: true, versionKey: false, new: true },
);

module.exports = model("sys_user", SysUserSchema);
