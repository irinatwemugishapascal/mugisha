import api from "./client";

export const getStockIn = () => api.get("/stock-in");
export const createStockIn = (payload) => api.post("/stock-in", payload);
