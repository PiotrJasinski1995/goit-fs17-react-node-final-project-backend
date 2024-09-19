const passport = require("passport");
const jwt = require("jsonwebtoken");
const secret = process.env.ACCESS_SECRET;

const auth = (req, res, next) => {
  passport.authenticate("jwt", { session: false }, (err, user, info) => {
    if (!user || err) {
      return res.status(401).json({
        status: "error",
        code: 401,
        message: `${info}`,
        data: "Unauthorized",
      });
    }

    req.user = user;
    const authHeader = req.headers["authorization"];
    const token = authHeader.substring(7, authHeader.length);
    const decoded = jwt.verify(token, secret);
    if (user.sid !== decoded.sid) {
      return res.status(401).json({
        status: "error",
        code: 401,
        message: "Invalid session id",
        data: "Unauthorized",
      });
    }
    next();
  })(req, res, next);
};

module.exports = auth;
