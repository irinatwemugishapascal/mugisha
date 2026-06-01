const express = require("express");
const stockInController = require("../controllers/stockInController");
const requireAuth = require("../middleware/auth");

const router = express.Router();
router.post("/", requireAuth, stockInController.create);
router.get("/", requireAuth, stockInController.list);
module.exports = router;
