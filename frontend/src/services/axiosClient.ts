import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000";

const axiosClient = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: Attach Token
axiosClient.interceptors.request.use(
  (config) => {
    let token = "";
    if (typeof window !== "undefined") {
      // Try fetching token from cookies
      const match = document.cookie.match(/(^| )token=([^;]+)/);
      if (match) {
        token = match[2];
      }
    }
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle errors
axiosClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    // Check if unauthorized and not retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (typeof window !== "undefined") {
        // Clear cookie
        document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
        // Redirect to login page
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
