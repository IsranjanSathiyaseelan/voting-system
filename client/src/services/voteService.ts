import { api } from "./api";
import type { VoteRequest, DailyVoteCount, VoteStatusResponse } from "../types/vote";

export type { DailyVoteCount };

export const voteService = {
  async castVote(payload: VoteRequest): Promise<string> {
    const response = await api.post<string>("/votes", payload);
    return response.data;
  },

  async getDailyVotes(): Promise<DailyVoteCount[]> {
    const response = await api.get<DailyVoteCount[]>("/votes/daily");
    return response.data;
  },

  async getVoteStatus(userId: number, organizationId: number): Promise<VoteStatusResponse> {
    const response = await api.get<VoteStatusResponse>("/votes/status", {
      params: { userId, organizationId },
    });
    return response.data;
  },

  async getElectionVoteStatus(userId: number, electionId: number): Promise<VoteStatusResponse> {
    const response = await api.get<VoteStatusResponse>("/votes/status/election", {
      params: { userId, electionId },
    });
    return response.data;
  },
};
