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
app.use(
  cors({
    origin: function (origin, callback) {
      // bypass the requests with no origin (like curl requests, mobile apps, etc )
      if (!origin) return callback(null, true);

      if (allowedDomains.indexOf(origin) === -1) {
        const msg = `This site ${origin} does not have an access. Only specific domains are allowed to access it.`;
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
  })
);
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
