const mongoose = require("mongoose");
const validator = require("validator");
const userschema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "User must have name"],
      minlength: 3,
      maxlength: 50,
    },
    email: {
      type: String,
      required: [true, "User must have email"],
      unique: [true, "email already in use"],
      validate: [validator.isEmail, "Please provide a valid email"],
    },
    userphoto: {
      type: String,
      default: "image",
    },
    role: {
      type: String,
      enum: ["user", "admin", "guide"], // enumaration ,the role can have anu of the following
      default: "user",
    },
    password: {
      type: String,
      required: [true, "User must have password"],
      select: false,
      // validate: {
      //   validator: function () {
      //     return password.length > 7;
      //   },
      //   message: "Password must contain at least 8 characters",
      // },
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

userschema.virtual("bookings", {
  ref: "bookings",
  foreignField: "user",
  localField: "_id",
});
const User = mongoose.model("user", userschema);
module.exports = User;
