const express = require("express");

const router = express.Router();

const ctrlUsers = require("../../controllers/users");
const ctrlWrapper = require("../../utils/ctrlWrapper");

router.patch("/balance", ctrlWrapper(ctrlUsers.updateBalance));
router.get("/", ctrlWrapper(ctrlUsers.getCurrent));

module.exports = router;
