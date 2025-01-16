const mongoose = require("mongoose");

const Eventschema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "An event must have a name "],
      minlength: 3,
      maxlength: 50,
    },
    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    description: {
      type: String,
      required: [true, "An event must have a description "],
      minlength: 3,
      maxlength: 1000,
    },
    venue: {
      type: String,
      required: [true, "An event must have a venue "],
      minlength: 3,
    },
    eventtime: {
      type: Date,
      required: [true, "An event must have a time "],
    },
    duration: {
      type: Number,
      default: 2,
    },
    opento: {
      type: String,
      default: "every one",
    },
    photo: {
      type: String,
      // required: [true, "An event must have a photo "],
    },
    price: {
      type: Number,
      default: 0,
    },
    reached: {
      type: Number,
      default: 0,
    },
    reviewed: {
      type: Boolean,
      default: false,
    },
    createdat: {
      type: Date,
      default: Date.now(),
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
  {
    strictPopulate: false,
  }
);

Eventschema.pre("find", function (next) {
  this.populate({
    path: "host",
    select: "name userphoto",
  });
  this.populate({
    path: "bookings",
  });
  next();
});

Eventschema.virtual("bookings", {
  ref: "bookings",
  foreignField: "event",
  localField: "_id",
  count: true,
});
Eventschema.index({ name: "text", venue: "text", description: "text" });
// Notesschema.index({title:'text',location:'text',tag:'text'})
const Eventmodel = mongoose.model("event", Eventschema);

module.exports = Eventmodel;
