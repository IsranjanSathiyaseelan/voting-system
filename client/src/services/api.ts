import axios from "axios";

const TOKEN_STORAGE_KEY = "voting-system-token";
const USER_STORAGE_KEY = "voting-system-user";

const baseURL = import.meta.env.VITE_API_BASE_URL || "/api";

export const api = axios.create({
  baseURL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;

      let errorMessage = "An error occurred while processing your request.";

      if (status === 401) {
        errorMessage = "Session expired or unauthorized. Please sign in again.";
      } else if (status === 403) {
        errorMessage = "Access restricted. You may not be assigned to an organization or lack permissions.";
      }

      if (typeof data === "string" && data.trim()) {
        errorMessage = data.trim();
      } else if (data && typeof data === "object") {
        if (typeof data.message === "string" && data.message.trim()) {
          errorMessage = data.message.trim();
        } else if (typeof data.error === "string" && data.error.trim()) {
          errorMessage = data.error.trim();
        } else if (Array.isArray(data.errors) && data.errors.length > 0) {
          errorMessage = data.errors
            .map((e: { defaultMessage?: string } | string) =>
              typeof e === "string" ? e : e.defaultMessage ?? JSON.stringify(e),
            )
            .join(", ");
        }
      }

      return Promise.reject(new Error(errorMessage));
    }

    return Promise.reject(
      new Error("Backend service unavailable. Please check if the Spring Boot server is running on port 8080."),
    );
  },
);

export { TOKEN_STORAGE_KEY, USER_STORAGE_KEY };
