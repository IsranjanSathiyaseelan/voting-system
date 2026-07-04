import { api } from "./api";
import type { VoteRequest } from "../types/vote";

export const voteService = {
  async castVote(payload: VoteRequest): Promise<string> {
    const response = await api.post<string>("/votes", payload);
    return response.data;
  },
};
