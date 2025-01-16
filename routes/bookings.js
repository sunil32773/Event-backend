const express = require("express");
const router = express.Router();
const {
  getcheckout,
  sendbookings,
  send_stats,
} = require("../controllers/bookingscontroller");
const { protect } = require("../controllers/authcontrollers");

router.route("/checkout-session/:eventid").get(protect, getcheckout);
router.route("/getbookings/:id").get(protect, sendbookings);

module.exports = router;
