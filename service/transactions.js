const Transaction = require("./schemas/transactions");

const addTransaction = (body) => {
  return Transaction.create(body);
};

const deleteTransaction = (id) => {
  return Transaction.findByIdAndDelete({ _id: id });
};

const getTransactionByUser = async (ownerId, transactionType = null) => {
  try {
    if (transactionType) {
      const transactions = await Transaction.find({
        owner: ownerId,
        transactionType,
      });
      return transactions;
    } else {
      const transactions = await Transaction.find({ owner: ownerId });
      return transactions;
    }
  } catch (error) {
    console.error("Error fetching transactions:", error);
    throw error;
  }
};

module.exports = { addTransaction, deleteTransaction, getTransactionByUser };
