const mongoose = require("mongoose");
const { model, Schema } = mongoose;

const SysTrxEducationSchema = Schema(
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
    degree_name: {
      type: String,
      default: null,
      minlength: [2, "The school name must be at least 2 characters"],
      required: [true, "Degree can't empty!"],
    },
    school_name: {
      type: String,
      minlength: [5, "The school name must be at least 5 characters"],
      required: [true, "School name can't empty!"],
    },
    start_date: {
      type: String,
      required: [true, "Start date enter school can't empty!"],
    },
    end_date: {
      type: String,
      required: [true, "End date enter school can't empty!"],
    },
  },
  { timestamps: true, versionKey: false, new: true },
);

module.exports = model("sys_trx_education", SysTrxEducationSchema);
