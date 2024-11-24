const mongoose = require("mongoose");
const { model, Schema } = mongoose;

const AuthSchema = Schema(
  {
    username: {
      type: String,
      minlength: [6, "The username must be at least 6 character!"],
      required: [true, "Username harus diisi"],
    },
    email: {
      type: String,
      minlength: [7, "The email must be at least 6 character!"],
      required: [true, "Email harus diisi"],
    },
    password: {
      type: String,
      minlength: [6, "The username must be at least 6 character!"],
      required: [true, "password harus diisi"],
    },
  },
  { timestamps: true, versionKey: false },
);

module.exports = model("sys_auth_user", AuthSchema);
