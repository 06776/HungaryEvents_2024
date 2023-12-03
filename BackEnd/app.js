const express = require("express");
const ErrorHandler = require("./middleware/error");
const app = express();
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const cors = require("cors");

app.use(
  cors({
    origin: [""],
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());
app.use("/test", (req, res) => {
  res.send("Hello world!");
});

app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));

if (process.env.NODE_ENV !== "PRODUCTION") {
  require("dotenv").config({
    path: "config/.env",
  });
}

const user = require("./controllers/user");
const admin = require("./controllers/admin");
const communityProgram = require("./controllers/communityProgram");
const sight = require("./controllers/sight");
const message = require("./controllers/message");

app.use("/api/v2/user", user);
app.use("/api/v2/message", message);
app.use("/api/v2/admin", admin);
app.use("/api/v2/communityProgram", communityProgram);
app.use("/api/v2/sight", sight);

app.use(ErrorHandler);

module.exports = app;
