const mongoose = require("mongoose");
const { model, Schema } = mongoose;

const SysStackSchema = Schema(
  {
    exp_id: {
      type: mongoose.Types.ObjectId,
      ref: "sys_auth_user",
    },
    stack_id: {
      type: mongoose.Types.ObjectId,
      ref: "sys_refparameter",
      required: true,
      unique: true,
    },
  },
  { timestamps: true, versionKey: false },
);

module.exports = model("sys_stack_exp", SysStackSchema);
