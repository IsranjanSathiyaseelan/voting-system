import { api } from "./api";
import type { RegisterRequest, User } from "../types/auth";

export interface Organization {
  id: number;
  name: string;
}

export const userService = {
  async register(payload: RegisterRequest): Promise<User> {
    const response = await api.post<User>("/users/register", payload);
    return response.data;
  },

  async getOrganizations(): Promise<Organization[]> {
    const response = await api.get<Organization[]>("/organizations/public");
    return response.data;
  },

  async getMembers(): Promise<User[]> {
    const response = await api.get<User[]>("/users/members");
    return response.data;
  },

  async updateMemberStatus(
    memberId: number,
    status: string
  ): Promise<User> {
    const response = await api.patch<User>(
      `/users/members/${memberId}/status`,
      null,
      {
        params: { status },
      }
    );
    return response.data;
  },

  async getProfile(): Promise<User> {
    const response = await api.get<User>("/users/profile");
    return response.data;
  },

  async changePassword(
    oldPassword: string,
    newPassword: string
  ): Promise<void> {
    await api.post("/users/change-password", {
      oldPassword,
      newPassword,
    });
  },
};