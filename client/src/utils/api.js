import axios from "axios";
import { getToken, logout } from "./auth";

/**
 * Backend mounted routes:
 * /api/auth
 * /api/tickets
 * /api/amc
 * /api/service-logs
 */

const api = axios.create({
  baseURL: "https://service-ticket-amc-system.onrender.com/api",
  headers: {
    "Content-Type": "application/json",
  },
});

/* ---------------- REQUEST INTERCEPTOR ---------------- */
api.interceptors.request.use(
  (config) => {
    const token = getToken();

    // ✅ normalize headers object
    config.headers = config.headers || {};

    // ✅ ALWAYS attach token if available
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // ✅ clean log
    console.log(
      "[API REQUEST]",
      (config.method || "GET").toUpperCase(),
      `${config.baseURL}${config.url}`,
      token ? "(AUTH ✅)" : "(AUTH ❌)"
    );

    return config;
  },
  (error) => Promise.reject(error)
);

/* ---------------- RESPONSE INTERCEPTOR ---------------- */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const url = error?.config?.url;

    console.log("[API ERROR STATUS]", status);
    console.log("[API ERROR URL]", url);
    console.log("[API ERROR DATA]", error?.response?.data);

    // ✅ Only logout on invalid/expired token (401 on protected APIs)
    const isAuthCall =
      url?.includes("/auth/login") || url?.includes("/auth/register");

    if (status === 401 && !isAuthCall) {
      logout();
      window.location.href = "/";
    }

    return Promise.reject(error);
  }
);

export default api;
