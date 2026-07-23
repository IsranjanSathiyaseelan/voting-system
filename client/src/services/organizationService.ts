import { api } from "./api";
import type { Candidate } from "../types/candidate";
import type { Organization } from "../types/organization";
import type { Election } from "../types/election";
import type { User } from "../types/auth";
import type { DashboardStats } from "../types/dashboard";

export interface VoteStatusResponse {
  hasVoted: boolean;
}

export const organizationService = {
  async getAll(): Promise<Organization[]> {
    const response = await api.get<Organization[]>("/organizations");
    return response.data;
  },

  async getById(id: number): Promise<Organization> {
    const response = await api.get<Organization>(`/organizations/${id}`);
    return response.data;
  },

  async create(organization: Omit<Organization, "id">): Promise<Organization> {
    const response = await api.post<Organization>("/organizations", organization);
    return response.data;
  },

  async update(id: number, organization: Omit<Organization, "id">): Promise<Organization> {
    const response = await api.put<Organization>(`/organizations/${id}`, organization);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/organizations/${id}`);
  },

  async getCandidates(id: number): Promise<Candidate[]> {
    const response = await api.get<Candidate[]>(`/organizations/${id}/candidates`);
    return response.data;
  },

  async getResults(id: number): Promise<Candidate[]> {
    const response = await api.get<Candidate[]>(`/organizations/${id}/results`);
    return response.data;
  },

  async getElections(id: number): Promise<Election[]> {
    const response = await api.get<Election[]>(`/organizations/${id}/elections`);
    return response.data;
  },

  async getMembers(id: number): Promise<User[]> {
    const response = await api.get<User[]>(`/organizations/${id}/members`);
    return response.data;
  },

  async getDashboardStats(): Promise<DashboardStats> {
    const response = await api.get<DashboardStats>("/organizations/dashboard/stats");
    return response.data;
  },

  async getVoteStatus(userId: number, organizationId: number): Promise<VoteStatusResponse> {
    const response = await api.get<VoteStatusResponse>("/votes/status", {
      params: { userId, organizationId },
    });
    return response.data;
  },
};
