const mongoose = require("mongoose");
const book = require("../models/Bookings");
const Expense = require("../models/Expenseschema");
const Event = require("../models/Eventschema");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

exports.sendbookings = async (req, res) => {
  try {
    const data = await book.findById(req.params.id);
    return res.status(200).json({
      status: "success",
      data,
    });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return res.status(400).json({
      status: "fail",
      message: error.message,
    });
  }
};

exports.getcheckout = async (req, res, next) => {
  // get the currently booked tour

  try {
    const event = await Event.findById(req.params.eventid);
    const price = event.price * 100;
    // create checkout session
    const clientSecret = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      client_reference_id: req.params.tourid,
      line_items: [
        {
          price_data: {
            currency: "INR",
            product_data: {
              name: event.name,
              images: [
                `https://res.cloudinary.com/drfvhp1jh/image/upload/${event.photo}`,
              ],
              description: event.description.slice(0, 80),
            },
            unit_amount: price, // amount in cents
          },
          quantity: 1, // You may adjust quantity if needed
        },
      ],
      mode: "payment", // Specify the mode: payment or subscription
      // customer_email: req.user.email,
      // success_url: `https://k-murali.github.io/Blogger?tour=${
      //   req.params.tourid
      // }&user=${req.user.id}&price=${900}`,
      success_url: `${req.protocol}://k-murali.github.io/event?event=${req.params.eventid}&user=${req.user.id}&price=${event.price}`,

      // not secure at all;
      cancel_url: `${req.protocol}://${req.get("host")}/tour/${
        req.params.tourid
      }`,
    });

    // create session as response;

    res.status(200).json({
      status: "success",
      clientSecret,
    });
  } catch (e) {
    console.log(e);
    res.status(400).send({
      status: "failed",
      message: e.message,
    });
  }
};

exports.createBookingCheckout = async (req, res, next) => {
  try {
    const { event, user, price } = req.query;
    if (!event || !user || !price) {
      return next();
    }

    const tempevent = await Event.findById(event);
    console.log(tempevent.host, tempevent);
    const income = await Expense.find({ type: "audience", event: event });
    let newIncome;
    if (income.length != 0) {
      newIncome = await Expense.findOneAndUpdate(
        {$and:[{ type: "audience" },{event: event}]},
        { $inc: { amount: price } },
        { new: true }
      );
    } else {
      newIncome = await Expense.create({
        amount: price,
        source: "bookings",
        type: "audience",
        event: event,
        user: tempevent.host,
      });
    }
    await book.create({ event, user, price });

    return next();
  } catch (e) {
    res.status(400).send({
      status: "failed",
      message: e.message,
    });
  }
};
