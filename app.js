const express = require("express");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

app.use("/api/users", require("./routes/routeuser"));
app.use("/api/events", require("./routes/routevent"));
app.use("/api/expenses", require("./routes/routeexpense"));
app.use("/api/bookings", require("./routes/bookings"));
app.use("/api/notify", require("./routes/routenotify"));

module.exports = app;
