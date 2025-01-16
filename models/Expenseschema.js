const mongoose = require("mongoose");
const Expenseschema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: true,
    },
    source: {
      type: String,
      default: "other",
    },
    Note: {
      type: String,
      default: this.source,
    },
    type: {
      type: String,
      enum: ["income", "expense", "audience"],
      lowercase: true,
      trim: true,
      required: [true, "you should specify it as either as income or expense"],
    },
    date: {
      type: Date,
      default: Date.now(),
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "event",
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
  { strictPopulate: false }
);
Expenseschema.index({ type: 1 });
const Expensemodel = mongoose.model("expense", Expenseschema);
module.exports = Expensemodel;
