const mongoose = require("mongoose");
const bCrypt = require("bcryptjs");
const { nanoid } = require("nanoid");

const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      match: [/[a-z0-9]+@[a-z0-9]/, "User email is not valid"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    accessToken: {
      type: String,
      default: null,
    },
    refreshToken: {
      type: String,
      default: null,
    },
    sid: {
      type: String,
      default: nanoid(),
    },
    balance: {
      type: Number,
      default: 0,
    },
  },
  { versionKey: false }
);

userSchema.methods.setPassword = function (password) {
  this.password = bCrypt.hashSync(password, bCrypt.genSaltSync(12));
};

userSchema.methods.validPassword = function (password) {
  return bCrypt.compareSync(password, this.password);
};

const User = mongoose.model("user", userSchema);

module.exports = User;
