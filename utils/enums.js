const expenseEnum = [
  { name: "products", icon: "products" },
  { name: "alcohol", icon: "alcohol" },
  { name: "entertainment", icon: "entertainment" },
  { name: "health", icon: "health" },
  { name: "transport", icon: "transport" },
  { name: "housing", icon: "housing" },
  { name: "technique", icon: "technique" },
  { name: "communal", icon: "communal" },
  { name: "sport", icon: "sport" },
  { name: "education", icon: "education" },
  { name: "other", icon: "other" },
];

const incomeEnum = [
  { name: "salary", icon: "salary" },
  { name: "additional-income", icon: "add-income" },
];

const transactionTypeEnum = ["expense", "income"];

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

module.exports = { expenseEnum, incomeEnum, transactionTypeEnum, monthNames };
