const express = require("express");
const { protect } = require("../controllers/authcontrollers");
const router = express.Router();
const {
  addexpense,
  getallexpense,
  editexpense,
  deleteexpense,
  get_stats,
} = require("../controllers/expensecontrollers");
router.route("/getallexpenses").get(protect, getallexpense);
router.route("/getstats").get(protect, get_stats);
router.route("/addexpense").post(protect, addexpense);
router.route("/editexpense/:id").patch(protect, editexpense);
router.route("/deleteexpense/:id").delete(protect, deleteexpense);
module.exports = router;
