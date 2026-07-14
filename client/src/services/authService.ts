import { api } from "./api";
import type { LoginRequest, User } from "../types/auth";

const USER_STORAGE_KEY = "voting-system-user";
const TOKEN_STORAGE_KEY = "voting-system-token";

interface AuthResponse {
  token: string;
  user: User;
}

const readStoredUser = (): User | null => {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
};

const writeStoredUser = (user: User | null): void => {
  if (user === null) {
    localStorage.removeItem(USER_STORAGE_KEY);
    return;
  }

  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
};

const writeStoredToken = (token: string | null): void => {
  if (token === null) {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    return;
  }

  localStorage.setItem(TOKEN_STORAGE_KEY, token);
};

export const authService = {
  async login(credentials: LoginRequest): Promise<User> {
    const response = await api.post<AuthResponse>("/auth/login", credentials);

    const { token, user } = response.data;
    writeStoredUser(user);
    writeStoredToken(token);

    return user;
  },

  async adminLogin(credentials: LoginRequest): Promise<User> {
    const response = await api.post<User>("/admin/login", credentials);

    writeStoredUser(response.data);
    writeStoredToken(null);

    return response.data;
  },

  getStoredUser(): User | null {
    return readStoredUser();
  },

  setStoredUser(user: User): void {
    writeStoredUser(user);
  },

  clearStoredUser(): void {
    writeStoredUser(null);
    writeStoredToken(null);
  },
};