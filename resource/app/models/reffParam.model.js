const mongoose = require("mongoose");
const { model, Schema } = mongoose;
const ReffparamModel = new Schema(
  {
    key: {
      type: Number,
    },
    value: {
      type: String,
      minlength: [1, "Panjang minimal 1 karakter"],
      required: [true, "Value harus diisi"],
      unique: true,
    },
    type: {
      type: String,
      minlength: [3, "Panjang type minimal 3 karakter"],
      required: [true, "Type harus diisi"],
    },
    description: {
      type: String,
      required: [true, "Description harus diisi"],
    },
    is_delete: {
      type: Boolean,
      default: false,
    },
    icon_id: {
      type: mongoose.Types.ObjectId,
      ref: "Image",
      default: null,
    },
    parent_id: {
      type: mongoose.Types.ObjectId,
      ref: "ReffParameter",
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true }, // Aktifkan virtuals untuk JSON response
    toObject: { virtuals: true }, // Aktifkan virtuals untuk object biasa
    collection: "reff_parameters",
  },
);
// Virtual field untuk children
ReffparamModel.virtual("children", {
  ref: "ReffParameter", // nama model relasi
  localField: "_id", // field di model ini
  foreignField: "parent_id", // field di model yang sama
});

module.exports = model("ReffParameter", ReffparamModel);
