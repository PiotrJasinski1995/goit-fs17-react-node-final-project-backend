require("dotenv").config();
const jwt = require("jsonwebtoken");
const jwtCheck = require("jwt-check-expiration");
const { nanoid } = require("nanoid");

const User = require("../service/schemas/users");
const access_secret = process.env.ACCESS_SECRET;
const refresh_secret = process.env.REFRESH_SECRET;

const usersService = require("../service/users");

const register = async (req, res, _next) => {
  const { email, password } = req.body;
  const registerUser = await User.findOne({ email });

  if (registerUser) {
    return res.status(409).json({
      status: "error",
      code: 409,
      message: "Provided email already exists",
      data: "Conflict",
    });
  }

  const newUser = new User({
    email,
  });

  await newUser.setPassword(password);
  await newUser.save();

  const { id } = newUser;
  const user = { email, id };

  res.status(201).json({
    status: "success",
    code: 201,
    message: "Registration successful",
    data: {
      user,
    },
  });
};

const login = async (req, res, _next) => {
  const { email, password } = req.body;
  const activeUser = await User.findOne({ email });

  if (!activeUser || !activeUser.validPassword(password)) {
    return res.status(400).json({
      status: "error",
      code: 400,
      message: "Incorrect login or password",
      data: "Bad request",
    });
  }

  const activeUserAccessToken = activeUser.accessToken;

  if (
    activeUserAccessToken !== null &&
    !jwtCheck.isJwtExpired(activeUserAccessToken)
  ) {
    return res.status(403).json({
      status: "error",
      code: 403,
      message: "User already logged in",
      data: "Bad request",
    });
  }

  const { sid } = activeUser;

  const payload = {
    id: activeUser.id,
    sid,
  };

  const accessToken = jwt.sign(payload, access_secret, {
    expiresIn: "50m",
  });
  const refreshToken = jwt.sign(payload, refresh_secret, {
    expiresIn: "7d",
  });

  res.cookie("jwt", refreshToken, {
    httpOnly: true,
    sameSite: "None",
    secure: true,
    maxAge: 24 * 60 * 60 * 1000,
  });

  activeUser.accessToken = accessToken;
  activeUser.refreshToken = refreshToken;
  activeUser.save();
  const { balance, id } = activeUser;
  const transactions = await usersService.listTransactions(id);

  const userData = { email, balance, id, transactions };
  const loginData = { accessToken, refreshToken, sid, userData };

  return res.status(200).json({
    status: "success",
    code: 200,
    data: loginData,
  });
};

const logout = async (req, res, _next) => {
  const refreshToken = req.cookies?.jwt;

  if (!refreshToken)
    return res.status(204).json({
      status: "success",
      code: 204,
      message: "Refresh token is missing. User logged out",
      data: "No Content",
    });

  const user = req.user;

  await User.updateOne(
    { _id: user._id },
    { $set: { accessToken: null, refreshToken: null, sid: nanoid() } }
  );

  res.clearCookie("jwt", { httpOnly: true, sameSite: "Strict", secure: true });

  return res.status(200).json({
    status: "success",
    code: 200,
    message: `User ${user.email} logged out`,
  });
};

const refreshToken = async (req, res, _next) => {
  const refreshToken = req.cookies?.jwt;
  const { sid } = req.body;

  if (!refreshToken)
    return res.status(401).json({
      status: "failure",
      code: 401,
      message: "Refresh token is missing",
      data: "Unauthorized",
    });

  jwt.verify(refreshToken, refresh_secret, async (err, decoded) => {
    if (err) {
      return res.status(401).json({
        status: "failure",
        code: 401,
        message: "Invalid refresh token",
        data: "Unauthorized",
      });
    }

    if (!sid) {
      return res.status(404).json({
        status: "failure",
        code: 404,
        message: "Session id is missing in the request",
        data: "Bad request",
      });
    }

    const activeUser = await User.findById(decoded.id);
    if (!activeUser) {
      return res.res.status(404).json({
        status: "failure",
        code: 404,
        message: "User not found",
        data: "Bad request",
      });
    }

    const payload = {
      id: activeUser.id,
      sid,
    };

    const accessToken = jwt.sign(payload, access_secret, {
      expiresIn: "5m",
    });
    const refreshToken = jwt.sign(payload, refresh_secret, {
      expiresIn: "7d",
    });

    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      sameSite: "None",
      secure: true,
      maxAge: 24 * 60 * 60 * 1000,
    });

    activeUser.accessToken = accessToken;
    activeUser.refreshToken = refreshToken;
    activeUser.sid = sid;
    activeUser.save();

    const sessionData = { accessToken, refreshToken, sid };

    return res.status(200).json({
      status: "success",
      code: 200,
      message: `New tokens generated`,
      data: { sessionData },
    });
  });
};

module.exports = {
  register,
  login,
  logout,
  refreshToken,
};
