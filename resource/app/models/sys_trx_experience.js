const mongoose = require("mongoose");
const { model, Schema } = mongoose;

const SysTrxExperienceSchema = Schema(
  {
    key: {
      type: Number,
      required: true,
    },
    user_id: {
      type: mongoose.Types.ObjectId,
      ref: "sys_auth_user",
      required: [true, "Invalid credentials"],
    },
    role_name: {
      type: String,
      minlength: [3, "Role name must be at least 3 character"],
      required: [true, "Role name can't be empty!"],
    },
    stacks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "sys_refparameter",
      },
    ],
    product_name: {
      type: String,
      minlength: [3, "Prudct name must be at least 3 character"],
      required: [true, "Product name can't be empty!"],
    },
    achievments: {
      type: [String],
      required: true,
    },
    company_name: {
      type: String,
      minlength: [3, "Company name must be at least 3 character"],
      required: [true, "Company name can't be empty!"],
    },
    start_date: {
      type: String,
      required: [true, "Start date join company can't be empty!"],
    },
    end_date: {
      type: String,
      required: [true, "End date join company can't be empty!"],
    },
  },
  { timestamps: true, versionKey: false, new: true },
);

module.exports = model("sys_trx_experience", SysTrxExperienceSchema);
