import api from "./client";

export const getSpareParts = () => api.get("/spare-parts");
export const createSparePart = (payload) => api.post("/spare-parts", payload);
