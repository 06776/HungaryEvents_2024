const app = require("./app");
const connectDatabase = require("./database/Database");

process.on("uncaughtException", (err) => {
  console.log("Error: ${err.message}");
  console.log("Shutting down the server due to Uncaught Exception");
});

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config({
    path: "backend/config/.env",
  });
}

connectDatabase();

const server = app.listen(process.env.PORT, () => {
  console.log(`Server is running on http://localhost:${process.env.PORT}`);
});

process.on("unhandledRejection", (err) => {
  console.log("Error: ${err.message}");
  console.log("Shutting down the server due to Unhandled Promise Rejection");
  server.close(() => {
    process.exit(1);
  });
});
