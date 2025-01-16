const express = require("express");
const {
  signup,
  login,
  protect,
  getuserdetails,
} = require("../controllers/authcontrollers");
const router = express.Router();

router.route("/signup").post(signup);
router.route("/login").post(login);

// router.route("/updateuser").patch(updateuser);
router.route("/getuserdetails").get(protect, getuserdetails);

module.exports = router;
