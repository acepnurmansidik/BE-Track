const mongoose = require("mongoose");
const { model } = mongoose;

const EWalletModel = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    style_card: {
      type: String,
      required: [true, "Style mode can't be empty!"],
      default: "default",
    },
    va_number: {
      type: String,
      required: [true, "VA number can't be empty"],
      default: "0000 0000 0000 0000 0000",
    },
    wallet_name: {
      type: String,
      minlength: [3, "Wallet name must be at least 3 character!"],
      required: [true, "Wallet name can't be empty"],
      default: "Indonesian Express",
    },
    slug: {
      type: String,
      minlength: [3, "Wallet name must be at least 3 character!"],
      // required: [true, "Slug can't be empty"],
    },
    amount: {
      type: Number,
      required: [true, "Amount can't be empty"],
      default: 0,
    },
    owner_name: {
      type: String,
      minlength: [3, "Owner must be at least 3 character!"],
      required: [true, "Owner name can't be empty"],
      default: "John Doe",
    },
    currency_id: {
      type: mongoose.Types.ObjectId,
      ref: "ReffParameter",
      required: true,
    },
    is_delete: {
      type: Boolean,
      default: false,
    },
    number: {
      type: String,
      required: [true, "VA number can't be empty"],
      default: "0000 0000",
    },
    exp: {
      type: String,
      required: [true, "VA number can't be empty"],
      default: "12/30",
    },
  },
  {
    timestamps: true,
    versionKey: false,
    collection: "ewallets",
  },
);

// Middleware to generate VA number and slug
EWalletModel.pre("save", async function (next) {
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
    const existingWallet = await model("EWallet").findOne({
      va_number: this.va_number,
      user_id: this.user_id,
    });
    isUnique = !existingWallet;
  }

  // Mendapatkan tanggal saat ini
  const now = new Date();
  // Mendapatkan bulan dalam angka (0-11) dan menambah 1 untuk mendapatkan (1-12)
  const bulanSekarang = now.getMonth() + 1;
  // Mendapatkan tahun dan mengambil dua digit terakhir
  const tahunSekarang = now.getFullYear() % 100;
  this.exp = `${bulanSekarang}/${tahunSekarang}`;
  this.number = [
    (Math.random() * 10000).toFixed(0),
    (Math.random() * 10000).toFixed(0),
  ].join(" ");
  this.owner_name = this.owner_name.toUpperCase();
  this.wallet_name = this.wallet_name.toUpperCase();

  // Generate slug
  this.slug = this.wallet_name
    .toLowerCase()
    .replace(/\s+/g, "-") // Replace all spaces with hyphens
    .replace(/[^\w-]+/g, ""); // Remove all non-word chars

  next();
});

module.exports = model("EWallet", EWalletModel);
