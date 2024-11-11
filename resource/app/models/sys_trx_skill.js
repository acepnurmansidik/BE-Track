const mongoose = require("mongoose");
const { model, Schema } = mongoose;

const SysTrxSkillSchema = Schema(
  {
    user_id: {
      type: mongoose.Types.ObjectId,
      ref: "sys_auth_user",
      required: true,
      unique: true,
    },
    skill_id: {
      type: mongoose.Types.ObjectId,
      ref: "sys_refparameter",
      required: true,
      unique: true,
    },
  },
  { timestamps: true, versionKey: false },
);

module.exports = model("sys_trx_skill", SysTrxSkillSchema);
