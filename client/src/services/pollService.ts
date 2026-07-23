import { api } from "./api";
import type { Poll, PollRequest } from "../types/poll";

export const pollService = {
  async getAll(): Promise<Poll[]> {
    const response = await api.get<Poll[]>("/polls");
    return response.data;
  },

  async getActive(): Promise<Poll[]> {
    const response = await api.get<Poll[]>("/polls/active");
    return response.data;
  },

  async getById(id: number): Promise<Poll> {
    const response = await api.get<Poll>(`/polls/${id}`);
    return response.data;
  },

  async create(payload: PollRequest): Promise<Poll> {
    const response = await api.post<Poll>("/polls", payload);
    return response.data;
  },

  async update(id: number, payload: PollRequest): Promise<Poll> {
    const response = await api.put<Poll>(`/polls/${id}`, payload);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/polls/${id}`);
  },
};
