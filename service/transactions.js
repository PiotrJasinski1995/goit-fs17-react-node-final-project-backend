const Transaction = require("./schemas/transactions");

const addTransaction = (body) => {
  return Transaction.create(body);
};

const deleteTransaction = (id) => {
  return Transaction.findByIdAndDelete({ _id: id });
};

module.exports = { addTransaction, deleteTransaction };
