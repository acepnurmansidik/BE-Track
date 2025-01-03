const mongoose = require("mongoose");
const { model, Schema } = mongoose;

const WalletSchema = new mongoose.Schema(
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
      // required: [true, "Slug can't be empty"],
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

// Middleware to generate VA number and slug
WalletSchema.pre("save", async function (next) {
  // Generate a unique VA number
  let isUnique = false;
  while (!isUnique) {
    this.va_number = [
      (Math.random() * 10000).toFixed(0),
      (Math.random() * 10000).toFixed(0),
      (Math.random() * 10000).toFixed(0),
      (Math.random() * 10000).toFixed(0),
      (Math.random() * 10000).toFixed(0),
    ].join(" ");

    // Check for uniqueness
    const existingWallet = await model("sys_wallet").findOne({
      va_number: this.va_number,
    });
    isUnique = !existingWallet;
  }

  this.owner_name = this.owner_name.toUpperCase();
  this.wallet_name = this.wallet_name.toUpperCase();

  // Generate slug
  this.slug = this.wallet_name
    .toLowerCase()
    .replace(/\s+/g, "-") // Replace all spaces with hyphens
    .replace(/[^\w-]+/g, ""); // Remove all non-word chars

  next();
});

module.exports = model("sys_wallet", WalletSchema);
