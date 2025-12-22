import axios from "axios";

const axiosClient = axios.create({
  baseURL: "http://localhost/api",
  headers: {
    "Content-Type": "application/json"
  },
  timeout: 10000
});

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.clear();
    }
    return Promise.reject(error.response?.data || error.message);
  }
);

export default axiosClient;
