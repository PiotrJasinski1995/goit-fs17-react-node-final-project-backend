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
const allowedDomains = [
  "https://kpiskorz27.github.io/",
  "https://kapusta-front-end.vercel.app/",
  "http://localhost:3000",
];

app.use(logger(formatsLogger));

const corsOptions = {
  origin: (origin, callback) => {
    if (allowedDomains.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
};
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

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
