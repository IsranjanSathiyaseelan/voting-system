import { api } from "./api";
import type { VoteRequest } from "../types/vote";

export interface DailyVoteCount {
  date: string;
  votes: number;
}

export const voteService = {
  async castVote(payload: VoteRequest): Promise<string> {
    const response = await api.post<string>("/votes", payload);
    return response.data;
  },

  async getDailyVotes(): Promise<DailyVoteCount[]> {
    const response = await api.get<DailyVoteCount[]>("/votes/daily");
    return response.data;
  },
};
