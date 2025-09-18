const mongoose = require("mongoose");
const { model, Schema } = mongoose;

const SysUserSchema = new Schema(
  {
    auth_id: {
      type: mongoose.Types.ObjectId,
      ref: "sys_auth_user",
      required: true, // perbaikan dari 'require' ke 'required'
      unique: true,
    },
    name: {
      type: String,
      minlength: [3, "Panjang name minimal 3 karakter"],
      required: [true, "Name can't be empty"],
    },
    device_token: {
      type: String,
      required: false,
      default: "",
    },
    pin: {
      type: String,
      required: false,
      default: "",
    },
  },
  {
    timestamps: true,
    versionKey: false,
    collection: "users",
    toJSON: { virtuals: true }, // Aktifkan virtuals untuk JSON response
    toObject: { virtuals: true }, // Aktifkan virtuals untuk object biasa
  },
);

// Virtual field untuk format tanggal bergabung
SysUserSchema.virtual("joined_at").get(function () {
  if (!this.createdAt) return null;
  return this.createdAt.toLocaleString("default", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
});
module.exports = model("User ", SysUserSchema);
