const mongoose = require("mongoose");
const bookingschema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.ObjectId,
      ref: "event",
      required: [true, "booking must belong to a event"],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "user",
      required: [true, "booking must belong to a user"],
    },
    price: {
      type: Number,
      required: [true, "booking must have a price"],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    paid: {
      type: Boolean,
      default: true,
    },
  },
  { strictPopulate: false },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

bookingschema.index({ event: 1 });
bookingschema.pre("findById", function (next) {
  this.populate({
    path: "event",
    select: "photo",
  });
  this.populate({
    path: "user",
  });
  next();
});
const Bookings = mongoose.model("bookings", bookingschema);
module.exports = Bookings;
