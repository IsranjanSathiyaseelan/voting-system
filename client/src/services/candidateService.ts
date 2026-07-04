import { api } from "./api";
import type { Candidate } from "../types/candidate";

export const candidateService = {
  async getCandidates(): Promise<Candidate[]> {
    const response = await api.get<Candidate[]>("/candidates");
    return response.data;
  },

  async getResults(): Promise<Candidate[]> {
    const response = await api.get<Candidate[]>("/candidates/results");
    return response.data;
  },

  async addCandidate(candidate: Omit<Candidate, "id">): Promise<Candidate> {
    const response = await api.post<Candidate>("/candidates", candidate);
    return response.data;
  },
};
