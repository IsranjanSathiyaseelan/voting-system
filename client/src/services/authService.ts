import { api } from "./api";
import type { LoginRequest, LoginResponse, User } from "../types/auth";

const USER_STORAGE_KEY = "voting-system-user";
const TOKEN_STORAGE_KEY = "voting-system-token";

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
    const response = await api.post<LoginResponse>("/auth/login", credentials);

    const { token, user } = response.data;
    writeStoredUser(user);
    writeStoredToken(token);

    return user;
  },

  async adminLogin(credentials: LoginRequest): Promise<User> {
    const response = await api.post<LoginResponse>("/auth/login", credentials);

    const { token, user } = response.data;
    writeStoredUser(user);
    writeStoredToken(token);

    return user;
  },

  getStoredUser(): User | null {
    return readStoredUser();
  },

  getStoredToken(): string | null {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  },

  setStoredUser(user: User): void {
    writeStoredUser(user);
  },

  clearStoredUser(): void {
    writeStoredUser(null);
    writeStoredToken(null);
  },

  async getProfile(): Promise<User> {
    const response = await api.get<User>("/users/profile");
    return response.data;
  },

  async updateProfile(profileData: Partial<User>): Promise<User> {
    const response = await api.put<User>("/users/profile", profileData);
    const updatedUser = response.data;
    
    const current = readStoredUser();
    if (current && current.id === updatedUser.id) {
      writeStoredUser(updatedUser);
    }
    return updatedUser;
  },

  async changePassword(data: { currentPassword: string; newPassword: string }): Promise<void> {
    await api.put("/users/change-password", data);
  },

  async forgotPassword(email: string): Promise<{ token: string }> {
    const response = await api.post<{ token: string }>("/users/forgot-password", { email });
    return response.data;
  },

  async resetPassword(data: { token: string; newPassword: string }): Promise<void> {
    await api.post("/users/reset-password", data);
  },
};