const { query } = require("express");
const usersService = require("../service/users");
const transactionsService = require("../service/transactions");

const {
  expenseEnum,
  incomeEnum,
  transactionTypeEnum,
  monthNames,
} = require("../utils/enums");

const addTransaction = async (req, res, next) => {
  const transactionType = req.transactionType;
  const activeUser = req.user;
  const transactionBody = req.body;
  const oldBalance = parseInt(activeUser.balance);
  let newBalance = 0;

  switch (transactionType) {
    case "income":
      newBalance = oldBalance + parseInt(transactionBody.amount);
      break;
    case "expense":
      newBalance = oldBalance - parseInt(transactionBody.amount);
      break;
    default:
      return res.status(403).json({
        status: "success",
        code: 403,
        message: "Wrong transaction type",
        data: "Forbidden",
      });
  }

  transactionBody.transactionType = transactionType;
  transactionBody.owner = req.user._id;

  try {
    const newTransaction = await transactionsService.addTransaction(
      transactionBody
    );

    if (!newTransaction) {
      return res.json({ status: "failure", code: 404, message: "Not found" });
    }

    const user = await usersService.updateBalance(req.user._id, newBalance);

    if (!user) {
      return res.json({ status: "failure", code: 404, message: "Not found" });
    }

    const { description, amount, date, category, id } = newTransaction;
    const transaction = { description, amount, date, category, id };
    const data = { newBalance, transaction };

    return res.status(201).json({
      status: "success",
      code: 200,
      message: "Transaction created",
      data,
    });
  } catch (error) {
    if (error.name === "CastError") {
      res.json({
        status: "failure",
        code: 404,
        message: "Invalid data format",
      });
    } else {
      next(error);
    }
  }
};

const getTransaction = async (req, res, _next) => {
  const transactionType = req.transactionType;

  return res.status(200).json({
    status: "success",
    code: 200,
    data: "userId, expenses: expenseArray, monthStats (to fill up)",
  });
};

const deleteTransaction = async function (req, res, _next) {
  return res.status(200).json({
    status: "success",
    code: 200,
    message: "Transaction deleted successfully",
  });
};

const getCategories = async function (req, res, _next) {
  const transactionType = req.transactionType;
  let categories = undefined;

  switch (transactionType) {
    case "income":
      categories = incomeEnum;
      break;
    case "expense":
      categories = expenseEnum;
      break;
    default:
      return res.status(403).json({
        status: "success",
        code: 403,
        message: "Wrong transaction type",
        data: "Forbidden",
      });
  }

  return res.status(200).json({
    status: "success",
    code: 200,
    data: categories,
  });
};

const getTransactionsDataForPeriod = async (req, res, next) => {
  return res.status(200).json(`{
    incomes: { incomeTotal, incomesData },
    expenses: { expenseTotal, expensesData },
  } (to fill up)`);
};

module.exports = {
  addTransaction,
  getTransaction,
  deleteTransaction,
  getCategories,
  getTransactionsDataForPeriod,
};
