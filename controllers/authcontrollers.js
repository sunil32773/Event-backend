const User = require("../models/Userschema");
const Expense = require("../models/Expenseschema");
const jwt = require("jsonwebtoken");
const jwt_secret = process.env.JWT_SECRET;
const bcrypt = require("bcryptjs");
const jwt_expiresin = process.env.JWT_EXPIRES_IN;

const Gen_token = (id) => {
  console.log(jwt_expiresin);
  return jwt.sign({ id }, jwt_secret, { expiresIn: jwt_expiresin });
};
const create_send_token = (user, statuscode, res) => {
  const token = Gen_token(user._id);
  const cookies_options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    // secure: true, // will be sent throught https only
    httpOnly: true, // receive and store it and send it along evry req
  };
  res.cookie("jwt", token, cookies_options);
  res.status(statuscode).json({ status: "success", token, user });
};
exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const userExist = await User.findOne({ email });
    if (userExist) {
      return res.json({
        status: "fail",
        message: "Email already exits please use different one..!",
      });
    }
    const secpass = await bcrypt.hash(password, 12);

    const user = new User({ name, email, password: secpass });
    newuser = await user.save();
    create_send_token(newuser, 201, res);
  } catch (e) {
    res.status(500).json({ status: "fail", user, message: e.message });
  }
};
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throw new Error("Invalid email or password");
    }
    const user = await User.findOne({ email }).select("+password").populate({
      path: "bookings",
      select: "event -user",
    });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res
        .status(401)
        .json({ status: "fail", message: "Invalid email or password" });
    }
    const token = Gen_token(user._id);
    res.status(200).json({ status: "success", token, user });
  } catch (e) {
    res.status(500).json({ status: "fail", message: e.message });
  }
};

exports.getuserdetails = async (req, res) => {
  try {
    const totalIncomeResult = await Expense.aggregate([
      { $match: { user: req.user._id } },
      {
        $group: {
          _id: null,
          totalincome: {
            $sum: {
              $cond: [
                { $ne: ["$type", "expense"] },
                "$amount",
                { $multiply: ["$amount", -1] },
              ],
            },
          },
        },
      },
    ]);

    const totalIncome =
      totalIncomeResult.length > 0 ? totalIncomeResult[0].totalincome : 0;

    let user = await User.findById(req.user._id).populate({
      path: "bookings",
      select: "event -user",
    });

    user = user.toObject();
    user.income = totalIncome;

    res.status(200).json({ status: "success", user });
  } catch (e) {
    res.status(500).json({ status: "fail", message: e.message });
  }
};

exports.protect = async (req, res, next) => {
  try {
    let token = req.headers.authorization;

    if (!token || !token.startsWith("Bearer ")) {
      return res.status(401).json({
        status: "fail",
        message: "No token, authorization denied",
      });
    }
    token = token.split(" ")[1];

    const decoded = jwt.verify(token, jwt_secret);
    req.user = await User.findById(decoded.id);
    if (!req.user) {
      return res.status(401).json({
        status: "fail",
        message: "User not found, authorization denied",
      });
    }
    next();
  } catch (e) {
    res.status(401).json({
      status: "fail",
      message: "Invalid token, authorization denied",
      error: e.message,
    });
  }
};

exports.retrict = async (req, res, next) => {
  try {
    const user = req.user;
    if (user.role != "admin") {
      return res.status(403).json({
        status: "fail",
        message: "Not authorized to perform this action",
      });
    }
    next();
  } catch (e) {
    res.status(500).json({ status: "fail", message: e.message });
  }
};
