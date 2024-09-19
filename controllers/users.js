const usersService = require("../service/users");

const getCurrent = async (req, res) => {
  const activeUser = req.user;
  const id = activeUser.id;

  const transactions = await usersService.listTransactions(id);

  const { email, balance } = activeUser;
  const user = { email, balance, transactions };

  res.status(200).json({
    status: "success",
    code: 200,
    data: user,
  });
};

const updateBalance = async (req, res) => {
  const newBalance = req.body.balance;
  const id = req.user.id;

  if (!newBalance)
    return res.status(400).json({
      status: "failure",
      code: 400,
      message: "Balance is missing",
      data: "Bad request",
    });

  try {
    const user = await usersService.updateBalance(id, newBalance);

    if (!user) {
      return res.json({ status: "failure", code: 404, message: "Not found" });
    }

    return res.json({ status: "success", code: 200, data: { newBalance } });
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

module.exports = { getCurrent, updateBalance };
