const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const {
  expenseEnum,
  incomeEnum,
  transactionTypeEnum,
} = require("../../utils/enums");

// Kuba: Extracting category names for validation in Mongoose
const expenseCategories = expenseEnum.map((item) => item.name);
const incomeCategories = incomeEnum.map((item) => item.name);

const transactionSchema = Schema(
  {
    amount: {
      type: Number,
      required: [true, "Insert the amount for transaction"],
      min: [1, "Transaction amount must be greater than 0"],
    },
    date: {
      type: String,
      required: [true, "Choose date for transaction"],
      match: [
        /(([12]\d{3})-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))/,
        "Date should be in ISO format (YYYY-MM-DD)",
      ],
    },
    category: {
      type: String,
      required: [true, "Choose category for transaction"],
      enum: [
        ...expenseCategories,
        ...incomeCategories,
        `Category must be one of the given type: ${expenseCategories}, ${incomeCategories}`,
      ], // Kuba: needed due to changes in enums.js
    },
    transactionType: {
      type: String,
      required: [true, "Choose type of category for transaction"],
      enum: [
        ...transactionTypeEnum,
        `Transaction type should have values: ${transactionTypeEnum}`,
      ],
    },
    description: {
      type: String,
      required: [true, "Description field cannot be empty"],
      default: "",
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: [true, "Transaction must be assigned to the user"],
    },
  },
  { versionKey: false }
);

const Transaction = mongoose.model("transaction", transactionSchema);

module.exports = Transaction;
