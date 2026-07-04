import { api } from "./api";
import type { LoginRequest, User } from "../types/auth";

const USER_STORAGE_KEY = "voting-system-user";

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

export const authService = {
  async login(credentials: LoginRequest): Promise<User> {
    const response = await api.post<User>("/users/login", credentials);

    const user = response.data;
    writeStoredUser(user);

    return user;
  },

  getStoredUser(): User | null {
    return readStoredUser();
  },

  setStoredUser(user: User): void {
    writeStoredUser(user);
  },

  clearStoredUser(): void {
    writeStoredUser(null);
  },
};