const express = require("express");

const router = express.Router();

const ctrlAuth = require("../../controllers/auth");
const userSchema = require("../../controllers/schemas/users");
const ctrlWrapper = require("../../utils/ctrlWrapper");
const validateSchema = require("../../middlewares/validateSchema");
const auth = require("../../middlewares/auth");

router.post(
  "/register",
  validateSchema(userSchema),
  ctrlWrapper(ctrlAuth.register)
);
router.post("/login", validateSchema(userSchema), ctrlWrapper(ctrlAuth.login));
router.post("/logout", auth, ctrlWrapper(ctrlAuth.logout));
router.post("/refresh", ctrlWrapper(ctrlAuth.refreshToken));
// router.get("/google");

module.exports = router;
