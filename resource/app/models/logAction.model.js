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
    },
    before: {
      type: Schema.Types.Mixed,
    },
    after: {
      type: Schema.Types.Mixed,
    },
  },
  { timestamps: true, versionKey: false, new: true },
);

module.exports = model("log_actions", LogActionModel);
