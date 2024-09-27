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

function calculateMonthlySums(transactions, filterTransactionType) {
  const monthlySums = {
    January: "N/A",
    February: "N/A",
    March: "N/A",
    April: "N/A",
    May: "N/A",
    June: "N/A",
    July: "N/A",
    August: "N/A",
    September: "N/A",
    October: "N/A",
    November: "N/A",
    December: "N/A",
  };

  const monthlyTotals = {};

  transactions.forEach((transaction) => {
    const { amount, transactionType, date } = transaction;
    const monthNumber = new Date(date).getMonth();
    const monthName = monthNames[monthNumber];
    if (!monthlyTotals[monthName]) {
      monthlyTotals[monthName] = 0;
    }
    if (transactionType === filterTransactionType) {
      monthlyTotals[monthName] += amount;
    }
  });
  Object.keys(monthlySums).forEach((month) => {
    if (monthlyTotals[month] !== undefined && monthlyTotals[month] !== 0) {
      monthlySums[month] = monthlyTotals[month];
    }
  });

  return monthlySums;
}

const getExpenseTransaction = async (req, res, _next) => {
  const activeUser = req.user;

  try {
    const userTransactions = await transactionsService.getTransactionsByUser(
      activeUser._id,
      "expense"
    );

    const report = calculateMonthlySums(userTransactions, "expense");

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
    const userTransactions = await transactionsService.getTransactionsByUser(
      activeUser._id,
      "income"
    );

    const report = calculateMonthlySums(userTransactions, "income");

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
  const userId = activeUser._id.toString();

  try {
    const foundedTransaction = await transactionsService.getTransactionById(
      transactionId,
      userId
    );

    if (!foundedTransaction) {
      return res
        .status(404)
        .json({ status: "failure", code: 404, message: "Not found" });
    }

    const transactionUserId = foundedTransaction.owner.toString();

    if (userId !== transactionUserId) {
      return res.status(403).json({
        status: "failure",
        code: 403,
        message: "Transaction belongs to another user",
        data: "Forbidden",
      });
    }

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

function calculateMonthlyTransactions(transactions, date) {
  const dateRegex = /^\d{4}-(0[1-9]|1[0-2])$/;
  if (!dateRegex.test(date)) {
    throw new Error("Invalid date format. Please use YYYY-MM format.");
  }

  const [year, month] = date.split("-");

  const result = {
    incomes: {
      incomeTotal: 0,
      incomesData: {},
    },
    expenses: {
      expenseTotal: 0,
      expensesData: {},
    },
  };

  transactions.forEach((transaction) => {
    const transactionDate = transaction.date;

    const transactionYear = transactionDate.split("-")[0];
    const transactionMonth = transactionDate.split("-")[1];

    if (transactionYear === year && transactionMonth === month) {
      const { amount, category, transactionType, description } = transaction;

      if (transactionType === "income") {
        result.incomes.incomeTotal += amount;
        if (!result.incomes.incomesData[category]) {
          result.incomes.incomesData[category] = { total: 0 };
        }
        result.incomes.incomesData[category].total += amount;

        if (!result.incomes.incomesData[category][description]) {
          result.incomes.incomesData[category][description] = 0;
        }
        result.incomes.incomesData[category][description] += amount;
      } else if (transactionType === "expense") {
        result.expenses.expenseTotal += amount;
        if (!result.expenses.expensesData[category]) {
          result.expenses.expensesData[category] = { total: 0 };
        }
        result.expenses.expensesData[category].total += amount;

        if (!result.expenses.expensesData[category][description]) {
          result.expenses.expensesData[category][description] = 0;
        }
        result.expenses.expensesData[category][description] += amount;
      }
    }
  });

  return result;
}

const getTransactionsDataForPeriod = async (req, res, next) => {
  const activeUser = req.user;
  try {
    const userTransactions = await transactionsService.getTransactionsByUser(
      activeUser._id
    );

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

module.exports = {
  addTransaction,
  getExpenseTransaction,
  getIncomesTransaction,
  deleteTransaction,
  getCategories,
  getTransactionsDataForPeriod,
};
