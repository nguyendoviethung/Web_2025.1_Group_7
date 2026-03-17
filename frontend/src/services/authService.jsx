import axiosClient from "./axiosClient";

export const login = async (data) => {
  return axiosClient.post("/auth/login", data);
};

export const register = async (data) => {
  return axiosClient.post("/auth/register", data);
};

export const logout = async () => {
  try {
    await axiosClient.post("/auth/logout"); // xóa refreshToken trong DB + cookie
  } catch {
    // bỏ qua lỗi network, vẫn xóa local
  } finally {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
  }
};

export const getMe = async () => {
  return axiosClient.get("/auth/me");
};

export const refreshToken = async () => {
  return axiosClient.post("/auth/refresh");
};