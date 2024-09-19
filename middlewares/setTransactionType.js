const setTransactionType = (transactionType) => {
  return (req, _res, next) => {
    req.transactionType = transactionType;
    next();
  };
};

module.exports = setTransactionType;
