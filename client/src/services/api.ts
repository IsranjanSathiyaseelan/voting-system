import axios, { type InternalAxiosRequestConfig } from "axios";

export const TOKEN_STORAGE_KEY = "voting-system-token";
export const USER_STORAGE_KEY = "voting-system-user";

const rawBaseURL = import.meta.env.VITE_API_BASE_URL || "/api";
const baseURL =
  typeof rawBaseURL === "string" ? rawBaseURL.trim().replace(/\/+$/, "") : "";

// Named export — all services import as: import { api } from "./api"
export const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Endpoints that must never carry a user JWT (a stale one would be rejected)
const PUBLIC_PATHS = [
  "/auth/login",
  "/users/register",
  "/users/forgot-password",
  "/users/reset-password",
  "/organizations/public",
];

const isPublicUrl = (url?: string): boolean =>
  !!url && PUBLIC_PATHS.some((p) => url.includes(p));

const setHeader = (
  config: InternalAxiosRequestConfig,
  key: string,
  value: string,
): void => {
  if (!config.headers) return;
  if (typeof config.headers.set === "function") {
    config.headers.set(key, value);
  } else {
    config.headers[key] = value;
  }
};

// ── REQUEST INTERCEPTOR ──────────────────────────────────────────────────────
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const wso2Token = (import.meta.env.VITE_WSO2_TOKEN || "").trim();
    const rawUserToken = localStorage.getItem(TOKEN_STORAGE_KEY);
    const hasStoredToken =
      !!rawUserToken &&
      rawUserToken.trim() !== "" &&
      rawUserToken !== "null" &&
      rawUserToken !== "undefined";

    // Never send the user JWT on public endpoints (login, register, ...)
    const userToken =
      hasStoredToken && !isPublicUrl(config.url) ? rawUserToken!.trim() : null;

    // Always inject WSO2 gateway headers when a gateway token is configured
    if (wso2Token) {
      setHeader(config, "X-APIM-Authorization", `Bearer ${wso2Token}`);
      setHeader(config, "ApiKey", wso2Token);
    }

    // Post-login: user JWT in Authorization; pre-login: WSO2 token fallback
    if (userToken) {
      setHeader(config, "Authorization", `Bearer ${userToken}`);
      setHeader(config, "X-User-Token", `Bearer ${userToken}`);
    } else if (wso2Token) {
      setHeader(config, "Authorization", `Bearer ${wso2Token}`);
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// ── RESPONSE INTERCEPTOR ─────────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      let errorMessage = "An error occurred while processing your request.";

      // Parse WSO2 gateway fault objects
      let wso2FaultDescription: string | null = null;
      let wso2FaultCode: string | null = null;

      if (data && typeof data === "object") {
        const faultObj = data.fault || data;
        if (faultObj.description)
          wso2FaultDescription = String(faultObj.description).trim();
        else if (faultObj.message)
          wso2FaultDescription = String(faultObj.message).trim();
        // Normalize: WSO2 may send the code as a number or a string
        if (faultObj.code != null) wso2FaultCode = String(faultObj.code);
      } else if (typeof data === "string" && data.trim()) {
        const xmlMatch =
          data.match(/<ams:description>([^<]+)<\/ams:description>/i) ||
          data.match(/<ams:message>([^<]+)<\/ams:message>/i);
        const codeMatch = data.match(/<ams:code>(\d+)<\/ams:code>/i);
        if (codeMatch?.[1]) wso2FaultCode = codeMatch[1];
        if (xmlMatch?.[1]) {
          wso2FaultDescription = xmlMatch[1].trim();
        } else if (!data.startsWith("<")) {
          wso2FaultDescription = data.trim();
        }
      }

      const isWso2AuthError =
        wso2FaultCode === "900901" ||
        wso2FaultCode === "900902" ||
        (wso2FaultDescription != null &&
          /invalid credentials|correct access token|access failure for api/i.test(
            wso2FaultDescription,
          ));

      const isWso2ResourceNotFound =
        wso2FaultCode === "900906" ||
        (wso2FaultDescription != null &&
          /no matching resource found|doesn't match any resource/i.test(
            wso2FaultDescription,
          ));

      const isLoginRequest = !!error.config?.url?.includes("/auth/login");

      if (isWso2AuthError) {
        errorMessage = `WSO2 Gateway Error: ${
          wso2FaultDescription || "Invalid or missing access token"
        }. Check VITE_WSO2_TOKEN in client/.env.`;
      } else if (isWso2ResourceNotFound) {
        errorMessage =
          "WSO2 API Gateway: No matching resource found. Ensure VITE_API_BASE_URL includes '/api' (e.g. /votesecureapi/1.0.0/api) and the API is deployed.";
      } else if (status === 401) {
        if (isLoginRequest) {
          // Don't clear the session or say "expired" for a failed login
          errorMessage =
            wso2FaultDescription || "Invalid username or password.";
        } else {
          localStorage.removeItem(TOKEN_STORAGE_KEY);
          localStorage.removeItem(USER_STORAGE_KEY);
          errorMessage =
            "Session expired or unauthorized. Please sign in again.";
        }
      } else if (status === 403) {
        errorMessage =
          wso2FaultDescription ||
          "Access restricted. You may not be assigned to an organization or lack permissions.";
      } else if (status === 429 || wso2FaultCode === "900800") {
        errorMessage =
          "Request throttled by WSO2 API Gateway. Please wait a moment and try again.";
      } else {
        // Generic backend error extraction
        if (typeof data === "string" && data.trim() && !data.startsWith("<")) {
          errorMessage = data.trim();
        } else if (data && typeof data === "object") {
          if (typeof data.message === "string" && data.message.trim()) {
            errorMessage = data.message.trim();
          } else if (typeof data.error === "string" && data.error.trim()) {
            errorMessage = data.error.trim();
          } else if (Array.isArray(data.errors) && data.errors.length > 0) {
            errorMessage = data.errors
              .map((e: { defaultMessage?: string } | string) =>
                typeof e === "string"
                  ? e
                  : (e.defaultMessage ?? JSON.stringify(e)),
              )
              .join(", ");
          } else if (wso2FaultDescription) {
            errorMessage = wso2FaultDescription;
          }
        }
      }

      return Promise.reject(new Error(errorMessage));
    }

    // Network error / no response
    console.error("API / Gateway network error:", error);
    return Promise.reject(
      new Error(
        "Backend service unavailable. Please check if the server is running.",
      ),
    );
  },
);