const express = require("express");
const logger = require("morgan");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const auth = require("./middlewares/auth");

const authRouter = require("./routes/api/auth");
const usersRouter = require("./routes/api/users");
const transactionsRouter = require("./routes/api/transactions");

const app = express();

const formatsLogger = app.get("env") === "development" ? "dev" : "short";

app.use(logger(formatsLogger));
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));

require("./config/config-passport");

app.use("/auth", authRouter);
app.use(auth);
app.use("/user", usersRouter);
app.use("/transaction", transactionsRouter);

app.use((_req, res, _next) => {
    res.status(404).json({ message: "Not found" });
});

app.use((err, _req, res, _next) => {
    res.status(500).json({ message: err.message });
});

module.exports = app;