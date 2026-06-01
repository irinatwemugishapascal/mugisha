const express = require("express");
const authController = require("../controllers/authController");

const router = express.Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/me", authController.currentUser);
router.post("/logout", authController.logout);
router.post("/recover", authController.recoverPassword);

module.exports = router;
