import api from "./client";

export const getStockOut = () => api.get("/stock-out");
export const createStockOut = (payload) => api.post("/stock-out", payload);
export const updateStockOut = (id, payload) => api.put(`/stock-out/${id}`, payload);
export const deleteStockOut = (id) => api.delete(`/stock-out/${id}`);
