const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const LoansSchema = new Schema(
  {
    user_id: {
      type: mongoose.Types.ObjectId,
      ref: "users",
      required: true,
    },
    loan_id: {
      type: String,
      required: true,
      default: "",
    },

    partner_name: {
      type: String,
      required: true,
    },

    // true = user melakukan pinjaman (borrow)
    // false = user memberikan pinjaman (lend)
    is_borrow: {
      type: Boolean,
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    paid_amount: {
      type: Number,
      required: true,
      default: 0,
    },

    status: {
      type: String,
      enum: ["ongoing", "paid"],
      default: "ongoing",
    },

    note: {
      type: String,
      default: "",
    },

    // ------ TERMIN / JATUH TEMPO (PAYLATER STYLE) -----
    payment_terms: [
      {
        // due_date: { type: Date, required: true },
        amount: { type: Number, required: true },
        paid: { type: Boolean, default: false },
        is_delete: { type: Boolean, default: false },
        paid_at: { type: Date, default: null },
        transaction_id: {
          type: mongoose.Types.ObjectId,
          ref: "transactions",
          default: null,
        },
      },
    ],

    // transaksi awal saat pinjaman dibuat
    initial_transaction_id: {
      type: mongoose.Types.ObjectId,
      ref: "transactions",
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    collection: "loans",
  },
);

module.exports = model("Loans", LoansSchema);
