const Transaction = require("./schemas/transactions");

const addTransaction = (body) => {
  return Transaction.create(body);
};

module.exports = { addTransaction };
