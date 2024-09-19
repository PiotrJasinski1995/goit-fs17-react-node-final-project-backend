const validateSchema = (schema) => {
  const functionValidation = (req, res, next) => {
    const validationResult = schema.validate(req.body, {
      abortEarly: false,
    });
    if (validationResult.error) {
      const error_messages = validationResult.error.details.map(
        (error) => error.message
      );

      return res.status(400).json({
        status: "failure",
        code: 400,
        message: error_messages,
      });
    }
    next();
  };
  return functionValidation;
};

module.exports = validateSchema;
