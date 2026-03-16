import axiosClient from "./axiosClient";

export const login = async (data) => {
  return axiosClient.post("/auth/login", data);    
};

export const register = async (data) => {
  return axiosClient.post("/auth/register", data); 
};

export const logout = async () => {
  await axiosClient.post("/auth/logout");          
  localStorage.clear();
};

export const getMe = async () => {
  return axiosClient.get("/auth/me");            
};

export const refreshToken = async () => {
  return axiosClient.post("/auth/refresh");        
};