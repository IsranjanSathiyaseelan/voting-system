import { api } from "./api";
import type { Candidate, AddCandidatePayload } from "../types/candidate";

export const candidateService = {
  async getCandidates(): Promise<Candidate[]> {
    const response = await api.get<Candidate[]>("/candidates");
    return response.data;
  },

  async getResults(): Promise<Candidate[]> {
    const response = await api.get<Candidate[]>("/candidates/results");
    return response.data;
  },

  async getByElection(electionId: number): Promise<Candidate[]> {
    const response = await api.get<Candidate[]>(`/candidates/election/${electionId}`);
    return response.data;
  },

  async getResultsByElection(electionId: number): Promise<Candidate[]> {
    const response = await api.get<Candidate[]>(`/candidates/election/${electionId}/results`);
    return response.data;
  },

  async addCandidate(candidate: AddCandidatePayload): Promise<Candidate> {
    const response = await api.post<Candidate>("/candidates", candidate);
    return response.data;
  },
};