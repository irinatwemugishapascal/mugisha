const express = require("express");
const simsReportController = require("../controllers/simsReportController");
const requireAuth = require("../middleware/auth");

const router = express.Router();
router.get("/daily-stock-status", requireAuth, simsReportController.dailyStockStatus);
router.get("/daily-stockout", requireAuth, simsReportController.dailyStockOut);
module.exports = router;
