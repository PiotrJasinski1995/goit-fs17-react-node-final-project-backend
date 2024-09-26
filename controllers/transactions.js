const usersService = require("../service/users");
const transactionsService = require("../service/transactions");
const { expenseEnum, incomeEnum, monthNames } = require("../utils/enums");

const addTransaction = async (req, res, next) => {
  const transactionType = req.transactionType;
  const activeUser = req.user;
  const transactionBody = req.body;
  const amount = parseInt(transactionBody.amount);
  const oldBalance = parseInt(activeUser.balance);
  let newBalance = 0;

  switch (transactionType) {
    case "income":
      newBalance = oldBalance + amount;
      break;
    case "expense":
      newBalance = oldBalance - amount;
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
      return res
        .status(404)
        .json({ status: "failure", code: 404, message: "Not found" });
    }

    const user = await usersService.updateBalance(req.user._id, newBalance);

    if (!user) {
      return res
        .status(404)
        .json({ status: "failure", code: 404, message: "Not found" });
    }

    const { description, amount, date, category, id } = newTransaction;
    const transaction = { description, amount, date, category, id };
    const data = { newBalance, transaction };

    return res.status(201).json({
      status: "success",
      code: 201,
      message: "Transaction created",
      data,
    });
  } catch (error) {
    if (error.name === "CastError") {
      res.status(404).json({
        status: "failure",
        code: 404,
        message: "Invalid data",
      });
    } else {
      next(error);
    }
  }
};

function calculateMonthlyTransactions(transactions, date) {
  const dateRegex = /^\d{4}-(0[1-9]|1[0-2])$/;
  if (!dateRegex.test(date)) {
    throw new Error("Invalid date format. Please use YYYY-MM format.");
  }

  const [year, month] = date.split("-");

  const result = {
    incomes: {
      incomeTotal: 0,
      incomesData: [],
    },
    expenses: {
      expenseTotal: 0,
      expensesData: [],
    },
  };

  transactions.forEach((transaction) => {
    const transactionDate = transaction.date;
    const transactionYearMonth = transactionDate.substring(0, 7);

    console.log("Transaction Date:", transactionDate);
    console.log("Selected Year-Month:", date);

    let categoryData;

    if (transactionYearMonth === date) {
      const { amount, category, transactionType } = transaction;

      if (transactionType === "income") {
        result.incomes.incomeTotal += amount;

        categoryData = incomeEnum.find((item) => item.name === category);
        if (categoryData) {
          const existingCategory = result.incomes.incomesData.find(
            (item) => item.name === category
          );

          if (existingCategory) {
            existingCategory.amount += amount;
          } else {
            result.incomes.incomesData.push({
              name: category,
              icon: categoryData.icon,
              amount,
            });
          }
        }
      } else if (transactionType === "expense") {
        result.expenses.expenseTotal += amount;

        categoryData = expenseEnum.find((item) => item.name === category);
        if (categoryData) {
          const existingCategory = result.expenses.expensesData.find(
            (item) => item.name === category
          );

          if (existingCategory) {
            existingCategory.amount += amount;
          } else {
            result.expenses.expensesData.push({
              name: category,
              icon: categoryData.icon,
              amount,
            });
          }
        }
      }
    }
  });

  return result;
}

const getTransactionsDataForPeriod = async (req, res, next) => {
  const activeUser = req.user;
  try {
    const userTransactions = await transactionsService.getTransactionByUser(
      activeUser._id
    );
    console.log(userTransactions);

    const date = req.query.date;

    const report = calculateMonthlyTransactions(userTransactions, date);

    return res.status(200).json({
      status: "success",
      code: 200,
      data: report,
    });
  } catch (error) {
    res.status(400).json({
      status: "failure",
      code: 400,
      data: "Bad request (invalid 'date' format) / No token provided",
    });
  }
};

const getExpenseTransaction = async (req, res, _next) => {
  const activeUser = req.user;

  try {
    const userTransactions = await transactionsService.getTransactionByUser(
      activeUser._id,
      "expense"
    );
    console.log(userTransactions);

    const report = calculateMonthlyTransactions(userTransactions, "expense");

    const data = {
      expenses: userTransactions,
      monthStats: report,
    };
    return res.status(200).json({
      status: "success",
      code: 200,
      data,
    });
  } catch (error) {
    res.status(404).json({
      status: "failure",
      code: 404,
      data: "Invalid user / Invalid session",
    });
  }
};

const getIncomesTransaction = async (req, res, _next) => {
  const activeUser = req.user;

  try {
    const userTransactions = await transactionsService.getTransactionByUser(
      activeUser._id,
      "income"
    );

    const report = calculateMonthlyTransactions(userTransactions, "income");

    const data = {
      incomes: userTransactions,
      monthStats: report,
    };
    return res.status(200).json({
      status: "success",
      code: 200,
      data,
    });
  } catch (error) {
    res.status(404).json({
      status: "failure",
      code: 404,
      data: "Invalid user / Invalid session",
    });
  }
};

const deleteTransaction = async function (req, res, next) {
  const { transactionId } = req.params;
  const activeUser = req.user;

  console.log(transactionId);

  try {
    const transaction = await transactionsService.deleteTransaction(
      transactionId
    );

    if (!transaction) {
      return res
        .status(404)
        .json({ status: "failure", code: 404, message: "Not found" });
    }

    const transactionType = transaction.transactionType;
    const amount = parseInt(transaction.amount);
    const oldBalance = parseInt(activeUser.balance);
    let newBalance = 0;

    switch (transactionType) {
      case "income":
        newBalance = oldBalance - parseInt(amount);
        break;
      case "expense":
        newBalance = oldBalance + parseInt(amount);
        break;
      default:
        return res.status(403).json({
          status: "failure",
          code: 403,
          message: "Wrong transaction type",
          data: "Forbidden",
        });
    }

    const user = await usersService.updateBalance(req.user._id, newBalance);

    if (!user) {
      return res.json({ status: "failure", code: 404, message: "Not found" });
    }

    return res.json({
      status: "success",
      code: 200,
      message: "Transaction deleted",
      data: { newBalance },
    });
  } catch (error) {
    if (error.name === "CastError") {
      res.json({
        status: "failure",
        code: 404,
        message: "Invalid data",
      });
    } else {
      console.error(error);
      next(error);
    }
  }
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

module.exports = {
  addTransaction,
  getExpenseTransaction,
  getIncomesTransaction,
  deleteTransaction,
  getCategories,
  getTransactionsDataForPeriod,
};
