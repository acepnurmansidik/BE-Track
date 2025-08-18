const mongoose = require("mongoose");
const { model, Schema } = mongoose;

const LogActionModel = Schema(
  {
    type: {
      type: String,
      enum: ["CREATE", "UPDATE", "DELETE"],
    },
    target_id: {
      type: Schema.Types.ObjectId,
    },
    source: {
      type: String,
      default: "",
    },
    before: {
      type: Schema.Types.Mixed,
    },
    after: {
      type: Schema.Types.Mixed,
    },
  },
  { timestamps: true, versionKey: false, new: true, collection: "log_actions" },
);

module.exports = model("LogAction", LogActionModel);
