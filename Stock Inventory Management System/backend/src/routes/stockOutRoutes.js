const express = require("express");
const stockOutController = require("../controllers/stockOutController");
const requireAuth = require("../middleware/auth");

const router = express.Router();
router.post("/", requireAuth, stockOutController.create);
router.get("/", requireAuth, stockOutController.list);
router.put("/:id", requireAuth, stockOutController.update);
router.delete("/:id", requireAuth, stockOutController.remove);
module.exports = router;
