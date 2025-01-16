const Expense = require("../models/Expenseschema");
const Event = require("../models/Eventschema");
const mongoose = require("mongoose");
exports.addexpense = async (req, res) => {
  try {
    console.log("came here");
    const { amount, type, source, event, note } = req.body;
    const newexpense = await Expense.create({
      amount,
      type,
      source,
      note,
      event,
      user: req.user._id,
    });
    res.json({
      status: "success",
      data: newexpense,
    });
  } catch (e) {
    res.status(500).json({
      status: "fail",
      message: e.message,
    });
  }
};
exports.editexpense = async (req, res) => {
  try {
    const { amount, type, source, note } = req.body;
    const newexpense = await Expense.findByIdAndUpdate(
      { _id: req.params.id },
      { $set: { amount, type, source, note } },
      { new: true }
    );
    res.json({
      status: "success",
      data: newexpense,
    });
  } catch (e) {
    res.status(500).json({
      status: "fail",
      message: e.message,
    });
  }
};
exports.deleteexpense = async (req, res) => {
  try {
    const newexpense = await Expense.findByIdAndDelete(req.params.id);
    if (!newexpense) {
      return res
        .status(200)
        .json({ status: "success", message: " already deleted" });
    }
    res.status(200).json({
      status: "success",
      data: "deleted succesfully",
    });
  } catch (e) {
    res.status(500).json({
      status: "fail",
      message: e.message,
    });
  }
};
exports.getallexpense = async (req, res) => {
  try {
    const eventid = req.query.eventid;
    const userId = req.user._id;
    const newExpense = await Expense.find({
      event: eventid,
    }).sort("-date");

    res.json({
      status: "success",
      data: newExpense,
    });
  } catch (e) {
    res.status(500).json({
      status: "fail",
      message: e.message,
    });
  }
};

exports.get_stats = async (req, res) => {
  try {
    // const eventid = new mongoose.Types.ObjectId(req.query.eventid);
    // console.log("Event ID:", eventid);
    const newExpense = await Expense.aggregate([
      {
        $match: {
          user: req.user._id,
        },
      },
      {
        $group: {
          _id: "$event",
          totalIncome: {
            $sum: {
              $cond: [{ $ne: ["$type", "expense"] }, "$amount", 0],
            },
          },
          totalExpense: {
            $sum: {
              $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0],
            },
          },
          totalCount: { $sum: 1 },
        },
      },
    ]);

    res.json({
      status: "success",
      data: newExpense,
    });
  } catch (e) {
    console.error("Error fetching stats:", e);
    res.status(500).json({
      status: "fail",
      message: e.message,
    });
  }
};
