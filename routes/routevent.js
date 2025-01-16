const express = require("express");
const router = express.Router();
const {
  add_event,
  edit_event,
  delete_event,
  get_eventbyid,
  getuser_events,
  getall_events,
  get_new_events,
} = require("../controllers/eventcontrollers");
const { protect } = require("../controllers/authcontrollers");
const { createBookingCheckout } = require("../controllers/bookingscontroller");

router.route("/addevent").post(protect, add_event);
router.route("/delete/:eventid").delete(protect, delete_event);
router.route("/update/:eventid").patch(protect, edit_event);

router.route("/getbyid/:eventid").get(protect, get_eventbyid);
router.route("/getallevents").get(createBookingCheckout, getall_events);
router.route("/getuserevents").get(protect, getuser_events);

router.route("/getnewevents").get(protect, get_new_events);

module.exports = router;
