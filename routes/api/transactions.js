const express = require("express");

const router = express.Router();

const ctrlTransactions = require("../../controllers/transactions");
const {
  incomeSchema,
  expenseSchema,
} = require("../../controllers/schemas/transactions");
const ctrlWrapper = require("../../utils/ctrlWrapper");
const validateSchema = require("../../middlewares/validateSchema");
const setTransactionType = require("../../middlewares/setTransactionType");

router.post(
  "/income",
  validateSchema(incomeSchema),
  setTransactionType("income"),
  ctrlWrapper(ctrlTransactions.addTransaction)
);

router.get(
  "/income",
  setTransactionType("income"),
  ctrlWrapper(ctrlTransactions.getIncomesTransaction)
);

router.post(
  "/expense",
  validateSchema(expenseSchema),
  setTransactionType("expense"),
  ctrlWrapper(ctrlTransactions.addTransaction)
);

router.get(
  "/expense",
  setTransactionType("expense"),
  ctrlWrapper(ctrlTransactions.getExpenseTransaction)
);

router.delete(
  "/:transactionId",
  ctrlWrapper(ctrlTransactions.deleteTransaction)
);

router.get(
  "/income-categories",
  setTransactionType("income"),
  ctrlWrapper(ctrlTransactions.getCategories)
);

router.get(
  "/expense-categories",
  setTransactionType("expense"),
  ctrlWrapper(ctrlTransactions.getCategories)
);

router.get(
  "/period-data",
  ctrlWrapper(ctrlTransactions.getTransactionsDataForPeriod)
);

module.exports = router;
