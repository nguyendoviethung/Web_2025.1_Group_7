// utils/authService.js
import axiosClient from "./axiosClient";

export const login = async (data) => {
  return axiosClient.post("/login", data);
};

export const register = async (data) => {
  return axiosClient.post("/register", data);
};

export const logout = () => {
  localStorage.clear();
};
