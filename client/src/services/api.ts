import axios, {
  type InternalAxiosRequestConfig,
} from "axios";

export const TOKEN_STORAGE_KEY = "voting-system-token";
export const USER_STORAGE_KEY = "voting-system-user";

const rawBaseURL =
  import.meta.env.VITE_API_BASE_URL;

const baseURL =
  typeof rawBaseURL === "string"
    ? rawBaseURL.trim().replace(/\/+$/, "")
    : "";

export const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const rawUserToken =
      localStorage.getItem(TOKEN_STORAGE_KEY);

    const userToken =
      rawUserToken &&
      rawUserToken.trim() &&
      rawUserToken !== "null" &&
      rawUserToken !== "undefined"
        ? rawUserToken.trim()
        : null;

    if (userToken) {
      config.headers.set(
        "Authorization",
        `Bearer ${userToken}`,
      );
    }

    return config;
  },

  (error) => {
    return Promise.reject(error);
  },
);

export default api;
