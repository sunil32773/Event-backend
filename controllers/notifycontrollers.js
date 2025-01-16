const Notify = require("../models/Notifyschema");
const Book = require("../models/Bookings");

exports.addnotify = async (req, res) => {
  try {
    const { event, message, eventname } = req.body;
    const newNotify = await Notify.create({
      event,
      message,
      eventname,
    });
    res.status(201).json({
      status: "success",
      data: newNotify,
    });
  } catch (e) {
    res.status(500).json({
      status: "fail",
      message: e.message,
    });
  }
};
exports.getnotify = async (req, res) => {
  try {
    let notify;
    const query = req.query;
    if (Object.keys(query).length === 0) {
      const bookings = await Book.find({ user: req.user._id });
      const eventIds = bookings.map((booking) => booking.event);
      notify = await Notify.find({ event: { $in: eventIds } }).sort('-createdAt');
    } else {
      notify = await Notify.find({ event: req.query.eventid });
    }

    res.status(200).json({
      status: "success",
      data: notify,
    });
  } catch (e) {
    res.status(500).json({
      status: "fail",
      message: e.message,
    });
  }
};
