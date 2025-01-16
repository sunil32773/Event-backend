const Event = require("../models/Eventschema");
const Expense = require("../models/Expenseschema");
const Book = require("../models/Bookings");

exports.add_event = async (req, res) => {
  try {
    const { name, description, eventtime, venue, photo } = req.body;

    const newevent = await Event.create({
      name,
      description,
      host: req.user.id,
      eventtime,
      venue,
      photo,
    });

    res.status(201).json({ status: "success", data: newevent });
  } catch (e) {
    res.status(500).json({ status: "fail", message: e.message });
  }
};
exports.edit_event = async (req, res) => {
  try {
    const { name, description, photo, venue, price, eventtime, reviewed } =
      req.body;
    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.eventid,
      { name, description, photo, venue, price, eventtime, reviewed },
      { new: true }
    );
    res.status(200).json({
      status: "success",
      data: updatedEvent,
    });
  } catch (e) {
    res.status(500).json({ status: "fail", message: e.message });
  }
};
exports.delete_event = async (req, res) => {
  try {
    await Event.findByIdAndDelete(req.params.eventid);
    await Expense.deleteMany({ event: req.params.eventid });
    await Book.deleteMany({ event: req.params.eventid });
    res.status(200).json({
      status: "success",
      message: "Event deleted successfully",
    });
  } catch (e) {
    res.status(500).json({ status: "fail", message: e.message });
  }
};
exports.getuser_events = async (req, res) => {
  try {
    const events = await Event.find({ host: req.user }).sort("-createdat");
    res.status(200).json({ status: "success", data: events });
  } catch (e) {
    res.status(500).json({ status: "fail", message: e.message });
  }
};
exports.getall_events = async (req, res) => {
  try {
    const query = { ...req.query };
    console.log(query);
    const exclude = ["sort", "limit", "page", "date", "keyword"];
    exclude.forEach((e) => {
      delete query[e];
    });
    let querystr = JSON.stringify(query);
    querystr = querystr.replace(/\b(gt|gte|lt|lte)\b/g, (match) => `$${match}`);
    querystr = JSON.parse(querystr);

    const dateFilter = {
      createdat: {
        $gte: new Date(req.query.date?.gte || "2024-01-01"),
        $lte: new Date(req.query.date?.lte || Date.now()),
      },
    };
    querystr = { reviewed: { $ne: false }, ...dateFilter, ...querystr };
    console.log(querystr);
    let keyword = (req.query.keyword || "").trim();
    keyword = keyword
      .split(" ")
      .map((word) => `.*${word}.*`)
      .join(".*");
    keyword = keyword.trim();
    let events = Event.find({
      $and: [
        {
          $or: [
            { name: { $regex: keyword, $options: "i" } },
            { venue: { $regex: keyword, $options: "i" } },
            { description: { $regex: keyword, $options: "i" } },
          ],
        },
        querystr,
      ],
    });

    if (req.query.sort) {
      const sortby = req.query.sort.split(",").filter((field) => field.trim()); // Remove empty or whitespace fields
      const dbSortFields = sortby
        .filter((field) => field !== "bookings")
        .join(" ");
      if (dbSortFields) {
        events = await events.sort(dbSortFields);
      }
      if (sortby.includes("bookings")) {
        events = await events.exec(); // Fetch events from the database
        events = events.sort((a, b) => b.bookings - a.bookings);
      }
    } else {
      events = await events.sort("-createdat");
    }

    res.status(200).json({
      status: "success",
      data: events,
    });
  } catch (e) {
    res.status(500).json({ status: "fail", message: e.message });
  }
};
exports.get_eventbyid = async (req, res) => {
  try {
    await Event.findByIdAndUpdate(req.params.eventid, {
      $inc: { reached: 1 },
    });
    const event = await Event.findById(req.params.eventid).populate({
      path: "host",
      select: "name userphoto",
    });

    if (event) {
      let booked = await Book.find({ user: req.user._id });
      booked = booked.some((e) => e.event == req.params.eventid);
      res.status(200).json({
        status: "success",
        data: event,
        booked,
      });
    } else {
      res.status(200).json({
        status: "failed",
        data: " Not found int the database",
      });
    }
  } catch (e) {
    res.status(500).json({ status: "fail", message: e.message });
  }
};

exports.get_new_events = async (req, res) => {
  try {
    if (req.user.role == "admin") {
      const newevents = await Event.find({ reviewed: { $ne: true } });
      res.status(200).json({ status: "success", data: newevents });
    } else {
      return res.status(400).json({ status: "fail", message: "unorthorized" });
    }
  } catch (e) {
    res.status(500).json({ status: "fail", message: e.message });
  }
};
