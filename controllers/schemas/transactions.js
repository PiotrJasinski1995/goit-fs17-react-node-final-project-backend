const Joi = require("joi");

const { expenseEnum, incomeEnum } = require("../../utils/enums");

basicSchemaObject = {
  amount: Joi.number()
    .min(1)
    .required()
    .error((errors) => {
      errors.forEach((err) => {
        switch (err.code) {
          case "any.required":
            err.message = "Missing required field: 'amount'";
            break;
          case "number.empty":
            err.message = "Amount field cannot be empty";
            break;
          case "number.base":
            err.message = "Amount must be a number";
            break;
          case "number.min":
            err.message = `Amount should be greater than 0`;
            break;
          default:
            break;
        }
      });
      return errors;
    }),
  date: Joi.string()
    .pattern(
      new RegExp(/^(([12]\d{3})-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))$/)
    )
    .required()
    .error((errors) => {
      errors.forEach((err) => {
        switch (err.code) {
          case "any.required":
            err.message = "Missing required field: 'date'";
            break;
          case "string.empty":
            err.message = "Date field cannot be empty";
            break;
          case "string.pattern.base":
            err.message = `Date should be in ISO format (YYYY-MM-DD)`;
            break;
          default:
            break;
        }
      });
      return errors;
    }),
};

const incomeSchema = Joi.object().keys({
  ...basicSchemaObject,
  category: Joi.string()
    .valid(...incomeEnum)
    .required()
    .error((errors) => {
      errors.forEach((err) => {
        switch (err.code) {
          case "any.required":
            err.message = "Missing required field: 'category'";
            break;
          case "string.empty":
            err.message = "Category field cannot be empty";
            break;
          case "string.base":
            err.message = "Category must be a string";
            break;
          case "any.only":
            err.message = `Category must be one of the given type: [${incomeEnum}]`;
            break;
          default:
            break;
        }
      });
      return errors;
    }),
});

const expenseSchema = Joi.object().keys({
  ...basicSchemaObject,
  category: Joi.string()
    .valid(...expenseEnum)
    .required()
    .error((errors) => {
      errors.forEach((err) => {
        switch (err.code) {
          case "any.required":
            err.message = "Missing required field: 'category'";
            break;
          case "string.empty":
            err.message = "Category field cannot be empty";
            break;
          case "string.base":
            err.message = "Category must be a string";
            break;
          case "any.only":
            err.message = `Category must be one of the given type: [${expenseEnum}]`;
            break;
          default:
            break;
        }
      });
      return errors;
    }),
});

module.exports = { incomeSchema, expenseSchema };
