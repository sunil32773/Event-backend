const mongoose = require("mongoose");
const NotifySchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "event",
  },
  message: {
    type: String,
    required: true,
  },
  eventname: {
    type: String,
    default: "Unknown",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
NotifySchema.index({ event: 1 });
// NotifySchema.index({ event: 1, createdAt: 1 });

module.exports = mongoose.model("Notify", NotifySchema);
