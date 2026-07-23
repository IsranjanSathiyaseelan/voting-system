import { api } from "./api";
import type { Election, ElectionRequest } from "../types/election";

export const electionService = {
  async getAll(): Promise<Election[]> {
    const response = await api.get<Election[]>("/elections");
    return response.data;
  },

  async getActive(): Promise<Election[]> {
    const response = await api.get<Election[]>("/elections/active");
    return response.data;
  },

  async getById(id: number): Promise<Election> {
    const response = await api.get<Election>(`/elections/${id}`);
    return response.data;
  },

  async create(payload: ElectionRequest): Promise<Election> {
    const response = await api.post<Election>("/elections", payload);
    return response.data;
  },

  async update(id: number, payload: ElectionRequest): Promise<Election> {
    const response = await api.put<Election>(`/elections/${id}`, payload);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/elections/${id}`);
  },
};
