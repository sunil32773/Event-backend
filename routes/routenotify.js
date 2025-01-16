const express = require("express");
const router = express.Router();
const { addnotify, getnotify } = require("../controllers/notifycontrollers");
const { protect } = require("../controllers/authcontrollers");
router.route("/message").post(addnotify).get(protect, getnotify);

module.exports = router;
