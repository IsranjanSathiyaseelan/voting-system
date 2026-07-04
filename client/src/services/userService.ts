import { api } from "./api";
import type { RegisterRequest, User } from "../types/auth";

export const userService = {
  async register(payload: RegisterRequest): Promise<User> {
    const response = await api.post<User>("/users/register", {
      username: payload.username,
      email: payload.email,
      password: payload.password,
    });
    return response.data;
  },
};
