import axios, {
  type InternalAxiosRequestConfig,
} from "axios";

export const TOKEN_STORAGE_KEY = "voting-system-token";
export const USER_STORAGE_KEY = "voting-system-user";

const rawBaseURL =
  import.meta.env.VITE_API_BASE_URL || "/api";

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

/*
|--------------------------------------------------------------------------
| REQUEST INTERCEPTOR
|--------------------------------------------------------------------------
|
| WSO2 requires an API access token.
|
| Before login:
|   Authorization: Bearer <WSO2 token>
|
| After login:
|   Authorization: Bearer <user JWT>
|
*/

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const wso2Token =
      import.meta.env.VITE_WSO2_TOKEN?.trim();

    const rawUserToken =
      localStorage.getItem(TOKEN_STORAGE_KEY);

    const userToken =
      rawUserToken &&
      rawUserToken.trim() &&
      rawUserToken !== "null" &&
      rawUserToken !== "undefined"
        ? rawUserToken.trim()
        : null;

    /*
     * If the user has logged in,
     * use the user's JWT.
     */
    if (userToken) {
      config.headers.set(
        "Authorization",
        `Bearer ${userToken}`,
      );
    }

    /*
     * If the user has NOT logged in,
     * use the WSO2 API access token.
     */
    else if (wso2Token) {
      config.headers.set(
        "Authorization",
        `Bearer ${wso2Token}`,
      );
    }

    return config;
  },

  (error) => {
    return Promise.reject(error);
  },
);

/*
|--------------------------------------------------------------------------
| RESPONSE INTERCEPTOR
|--------------------------------------------------------------------------
*/

api.interceptors.response.use(
  (response) => {
    return response;
  },

  (error) => {
    /*
     * No response means network/connection problem.
     */
    if (!error.response) {
      console.error(
        "API Network Error:",
        error,
      );

      return Promise.reject(
        new Error(
          "Cannot connect to the API. Please check that WSO2 API Manager and the backend are running.",
        ),
      );
    }

    const { status, data } = error.response;

    let message =
      "An error occurred while processing your request.";

    /*
     * --------------------------------------------------------------
     * Extract WSO2 error message
     * --------------------------------------------------------------
     */

    if (data && typeof data === "object") {
      const fault = data.fault || data;

      if (fault.description) {
        message = String(fault.description);
      } else if (fault.message) {
        message = String(fault.message);
      } else if (data.message) {
        message = String(data.message);
      } else if (data.error) {
        message = String(data.error);
      }
    }

    /*
     * WSO2 sometimes returns XML/string responses.
     */
    if (
      typeof data === "string" &&
      data.trim()
    ) {
      const text = data.trim();

      const descriptionMatch = text.match(
        /<ams:description>(.*?)<\/ams:description>/i,
      );

      const messageMatch = text.match(
        /<ams:message>(.*?)<\/ams:message>/i,
      );

      if (descriptionMatch?.[1]) {
        message = descriptionMatch[1].trim();
      } else if (messageMatch?.[1]) {
        message = messageMatch[1].trim();
      } else if (!text.startsWith("<")) {
        message = text;
      }
    }

    /*
     * --------------------------------------------------------------
     * HTTP 401
     * --------------------------------------------------------------
     */

    if (status === 401) {
      /*
       * Don't immediately delete the WSO2 token.
       *
       * The 401 could be from WSO2 because the API token
       * is invalid/expired.
       */

      const description = message.toLowerCase();

      if (
        description.includes("missing credentials") ||
        description.includes("invalid credentials") ||
        description.includes("access token")
      ) {
        message =
          "WSO2 authentication failed. Please check your WSO2 access token.";
      } else {
        /*
         * User JWT may have expired.
         */
        localStorage.removeItem(
          TOKEN_STORAGE_KEY,
        );

        localStorage.removeItem(
          USER_STORAGE_KEY,
        );

        message =
          "Your session has expired. Please sign in again.";
      }
    }

    /*
     * --------------------------------------------------------------
     * HTTP 403
     * --------------------------------------------------------------
     */

    else if (status === 403) {
      message =
        message ||
        "You do not have permission to perform this action.";
    }

    /*
     * --------------------------------------------------------------
     * HTTP 404
     * --------------------------------------------------------------
     */

    else if (status === 404) {
      message =
        "API resource not found. Check the WSO2 resource path and HTTP method.";
    }

    /*
     * --------------------------------------------------------------
     * HTTP 429
     * --------------------------------------------------------------
     */

    else if (status === 429) {
      message =
        "Too many requests. Please wait and try again.";
    }

    console.error(
      `API Error ${status}:`,
      data,
    );

    return Promise.reject(
      new Error(message),
    );
  },
);

export default api;
