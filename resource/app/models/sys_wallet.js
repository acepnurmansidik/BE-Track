const mongoose = require("mongoose");
const { model, Schema } = mongoose;

const WalletSchema = Schema(
  {
    user_id: {
      type: mongoose.Types.ObjectId,
      ref: "sys_user",
      required: true,
    },
    va_number: {
      type: String,
      default: "0000 0000 0000 0000 0000",
      required: [true, "VA number can't be empty"],
    },
    wallet_name: {
      type: String,
      minlength: [3, "Wallet name must be at least 3 character!"],
      required: [true, "Wallet name can't be empty"],
    },
    slug: {
      type: String,
      minlength: [3, "Wallet name must be at least 3 character!"],
      required: [true, "Wallet name can't be empty"],
      unique: true,
    },
    amount: {
      type: Number,
      default: 0,
      required: [true, "Amount can't be empty"],
    },
    owner_name: {
      type: String,
      minlength: [3, "Owner must be at least 3 character!"],
      required: [true, "Owner name can't be empty"],
    },
  },
  { timestamps: true, versionKey: false },
);

module.exports = model("sys_wallet", WalletSchema);
