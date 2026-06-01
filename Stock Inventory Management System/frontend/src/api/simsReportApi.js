import api from "./client";

export const getDailyStockStatus = (date) =>
  api.get("/reports/daily-stock-status", { params: { date } });
export const getDailyStockOut = (date) => api.get("/reports/daily-stockout", { params: { date } });
