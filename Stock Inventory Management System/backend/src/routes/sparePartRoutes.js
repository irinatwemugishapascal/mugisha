const express = require("express");
const sparePartController = require("../controllers/sparePartController");
const requireAuth = require("../middleware/auth");

const router = express.Router();
router.post("/", requireAuth, sparePartController.create);
router.get("/", requireAuth, sparePartController.list);
module.exports = router;
