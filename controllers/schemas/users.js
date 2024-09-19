const Joi = require("joi");

const joiValidationSchema = Joi.object().keys({
  email: Joi.string()
    .trim()
    .email()
    .required()
    .error((errors) => {
      errors.forEach((err) => {
        switch (err.code) {
          case "any.required":
            err.message = "Missing required field: 'email'";
            break;
          case "string.empty":
            err.message = "Email address field cannot be empty";
            break;
          case "string.base":
            err.message = "Email must be a string";
            break;
          case "string.email":
            err.message = `Email has wrong format`;
            break;
          default:
            break;
        }
      });
      return errors;
    }),
  password: Joi.string()
    .required()
    .min(6)
    .error((errors) => {
      errors.forEach((err) => {
        switch (err.code) {
          case "any.required":
            err.message = "Missing required field: 'password'";
            break;
          case "string.empty":
            err.message = "Password field cannot be empty";
            break;
          case "string.base":
            err.message = "Password must be a string";
            break;
          case "string.min":
            err.message = `Password should have at least ${err.local.limit} characters`;
            break;
          default:
            break;
        }
      });
      return errors;
    }),
});

module.exports = joiValidationSchema;
