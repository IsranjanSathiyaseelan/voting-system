import { api } from "./api";
import type { RegisterRequest, User } from "../types/auth";

export const userService = {
  async register(payload: RegisterRequest): Promise<User> {
    const response = await api.post<User>("/users/register", payload);
    return response.data;
  },
};
