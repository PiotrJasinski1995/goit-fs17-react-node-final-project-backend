const User = require("./schemas/users");

const listTransactions = (owner) => {
  return User.find({ owner });
};

const updateBalance = (id, balance) => {
  return User.findByIdAndUpdate({ _id: id }, { balance });
};

module.exports = { listTransactions, updateBalance };
