const express = require("express");
const cors = require("cors");
const session = require("express-session");
const dotenv = require("dotenv");
const { connectDatabase } = require("./config/db");
const MySQLSessionStore = require("./config/mysqlSessionStore");
const authRoutes = require("./routes/authRoutes");
const sparePartRoutes = require("./routes/sparePartRoutes");
const stockInRoutes = require("./routes/stockInRoutes");
const stockOutRoutes = require("./routes/stockOutRoutes");
const simsReportRoutes = require("./routes/simsReportRoutes");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5174";

app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
  })
);
app.use(express.json());
app.set("trust proxy", 1);
app.use(
  session({
    name: "sims.sid",
    secret: process.env.SESSION_SECRET || "sims-exam-secret",
    resave: false,
    saveUninitialized: false,
    store: new MySQLSessionStore(),
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 8,
    },
  })
);

app.get("/api/health", (_req, res) => {
  res.json({ message: "SIMS API is running" });
});
app.use("/api/auth", authRoutes);
app.use("/api/spare-parts", sparePartRoutes);
app.use("/api/stock-in", stockInRoutes);
app.use("/api/stock-out", stockOutRoutes);
app.use("/api/reports", simsReportRoutes);

connectDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`SIMS server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  });
