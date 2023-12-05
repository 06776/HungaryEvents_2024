const express = require("express");
const ErrorHandler = require("./middleware/error");
const app = express();
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const cors = require("cors");

app.use(
  cors({
    origin: ["http://localhost:3000"],
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));

if (process.env.NODE_ENV !== "PRODUCTION") {
  require("dotenv").config({
    path: "config/.env",
  });
}

const user = require("./controllers/user");
const admin = require("./controllers/admin");
const program = require("./controllers/program");
const sight = require("./controllers/sight");
const message = require("./controllers/message");

app.use("/api/v2/user", user);
app.use("/api/v2/message", message);
app.use("/api/v2/admin", admin);
app.use("/api/v2/program", program);
app.use("/api/v2/sight", sight);

app.use(ErrorHandler);

module.exports = app;
